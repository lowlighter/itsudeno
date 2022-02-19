// Imports
import argv from "https://cdn.skypack.dev/string-argv@0.3.1"
import { debounce } from "https://deno.land/std@0.123.0/async/debounce.ts"
import type { DebouncedFunction } from "https://deno.land/std@0.123.0/async/debounce.ts"
import { iterateReader } from "https://deno.land/std@0.126.0/streams/conversion.ts"
import { ItsudenoError } from "../../meta/errors.ts"
import type { listener, options } from "./types.ts"

// Text encoder and decoder
const decoder = new TextDecoder()
const encoder = new TextEncoder()

/** Raw command executor */
export async function exec(command: string, {tracer = null, prompts = [], piped = true, bounce = 40, cwd, env}: options = {}) {
	let process
	try {
		// Spawn child process
		tracer?.vvvv(`exec: ${command}`)
		process = Deno.run({cmd: argv(command), cwd, env, stdin: prompts.length ? "piped" : "null", stdout: piped ? "piped" : "null", stderr: piped ? "piped" : "null"})

		// Extract result
		prompts = structuredClone(prompts)
		const stdio = {stdout: "", stderr: "", captured: []}
		const cursors = {stdout: 0, stderr: 0}
		const handler = debounce(handle, bounce)
		const [{success, code}, stdout, stderr] = await Promise.all([
			process.status(),
			listen(process, handler, {tracer, channel: "stdout", stdio, cursors, prompts, bounce}),
			listen(process, handler, {tracer, channel: "stderr", stdio, cursors, prompts, bounce}),
		])
		return {success, code, stdout, stderr, stdio}
	} catch (error) {
		if (error instanceof Deno.errors.NotFound)
			throw new ItsudenoError.Unsupported(`could not find executable: "${argv(command).shift()!}" `)
		throw new ItsudenoError(error)
	} finally {
		process?.close()
	}
}

/** Listen to a stdio channel and capture its output */
async function listen(process: Deno.Process, handler: DebouncedFunction<[Deno.Process, listener]>, {tracer, channel, stdio, cursors, prompts, bounce}: listener) {
	if (process[channel]) {
		handler(process, {tracer, channel, stdio, cursors, prompts, bounce})
		for await (const bytes of iterateReader(process[channel]!)) {
			stdio[channel] += decoder.decode(bytes)
			handler(process, {tracer, channel, stdio, cursors, prompts, bounce})
		}
	}
	return stdio[channel]
}

/** Handle stdin channel upon matching prompts */
async function handle(process: Deno.Process, {tracer, channel, stdio, cursors, prompts}: listener) {
	if (process.stdin) {
		if (prompts.length) {
			const prompt = prompts[0]
			// Search matching prompts
			if (((!prompt.stdout) && (!prompt.stderr)) || (prompt?.[channel]?.test?.(stdio[channel]))) {
				// Clean prompt from list before processing it
				const {stdin, stdout, stderr, capture = true, clean = true, flush = false} = prompts.shift()!
				const other = ({stdout: "stderr", stderr: "stdout"} as const)[channel]
				const match = stdout ?? stderr
				let matched = ""
				if (match) {
					;({"0": matched} = stdio[channel].substring(cursors[channel]).match(match)!)
					tracer?.vvvv(`exec: ${channel} matched ${match ?? ""}`)
				}

				// Cleaning output from match
				if (clean) {
					stdio[channel] = stdio[channel].replace(matched, "")
					cursors[channel] -= matched.length
					tracer?.vvvv(`exec: ${channel} cleaned out ${Deno.inspect(matched)}`)
				}

				if (flush) {
					Object.assign(stdio, {stdout: "", stderr: ""})
					tracer?.vvvv("exec: flushed stdio")
				}

				// Capture output of previous prompt
				const captured = stdio.captured.at(-1)
				if (captured) {
					captured[channel] = stdio[channel].substring(cursors[channel], stdio[channel].length - matched.length)
					captured[other] = stdio[other].substring(cursors[other], stdio[other].length)
					tracer?.vvvv("exec: updated last captured command content")
				}
				cursors.stdout = stdio.stdout.length
				cursors.stderr = stdio.stderr.length

				// Write to stdin
				if (stdin) {
					tracer?.vvvv(`exec: writting ${Deno.inspect(stdin)} to stdin`)
					await process.stdin.write(encoder.encode(`${stdin}\n`))

					if (capture)
						stdio.captured.push({stdout: "", stderr: "", stdin})
				}
			}
		}
		if (!prompts.length) {
			try {
				process.stdin.close()
				tracer?.vvvv("exec: no remaining prompts, closed stdin")
			} catch {
				// No-op
			}
		}
	}
}
