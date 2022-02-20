// Imports
import argv from "https://cdn.skypack.dev/string-argv@0.3.1"
import { debounce } from "https://deno.land/std@0.123.0/async/debounce.ts"
import type { DebouncedFunction } from "https://deno.land/std@0.123.0/async/debounce.ts"
import { iterateReader } from "https://deno.land/std@0.126.0/streams/conversion.ts"
import { ItsudenoError } from "../../meta/errors.ts"
import type { listener, exec, cursor, command } from "./types.ts"
import { stripColor } from "https://deno.land/std@0.123.0/fmt/colors.ts"

// Text encoder and decoder
const decoder = new TextDecoder()
const encoder = new TextEncoder()

/** Raw command executor */
export async function exec(command: string, {tracer = null, prompts = [], piped = true, bounce = 40, cwd, env, ansi = false}: exec = {}) {
	let process, handler
	try {
		// Spawn child process
		tracer?.vvvv(`exec: ${command}`)
		process = Deno.run({cmd: argv(command), cwd, env, stdin: prompts.length ? "piped" : "null", stdout: piped ? "piped" : "null", stderr: piped ? "piped" : "null"})

		// Parse stdio on-the-fly
		prompts = structuredClone(prompts)
		handler = debounce(handle, bounce)
		const stdio = {stdout: "", stderr: "", commands: [] as command[]}
		const closed = {stdout:false, stderr:false}
		const [{success, code}] = await Promise.all([
			process.status(),
			listen(process, handler, {tracer, channel: "stdout", stdio, closed, prompts}),
			listen(process, handler, {tracer, channel: "stderr", stdio, closed, prompts}),
		])

		//Strip ansi escape codes
		if (!ansi) {
			for (const command of stdio.commands) {
				for (const channel of ["stdin", "stdout", "stderr"] as const)
					command[channel] = stripColor(command[channel])
			}
			for (const channel of ["stdout", "stderr"] as const)
				stdio[channel] = stripColor(stdio[channel])
			tracer?.vvvv(`exec: stripped ansi escape codes from all outputs`)
		}

		//Extract results
		return {success, code, ...stdio}
	} catch (error) {
		//Handle errors
		if (error instanceof Deno.errors.NotFound)
			throw new ItsudenoError.Unsupported(`could not find executable: "${argv(command).shift()!}" `)
		throw new ItsudenoError(error)
	} finally {
		//Clean resources
		handler?.clear()
		for (const channel of ["stdin", "stdout", "stderr"] as const) {
			try {
				if (process?.[channel]) {
					process?.[channel]?.close()
					tracer?.vvvv(`exec: closed ${channel}`)
				}
			} catch {
				// No-op
			}
		}
		process?.close()
	}
}

/** Listen to a stdio channel and capture its output */
async function listen(process: Deno.Process, handler: DebouncedFunction<[Deno.Process, listener]>, {tracer, channel, stdio, closed}: listener) {
	if (process[channel]) {
		handler(process, arguments[2])
		for await (const bytes of iterateReader(process[channel]!)) {
			if (closed[channel])
				break
			const buffer = decoder.decode(bytes)
			stdio[channel] += buffer
			tracer?.vvvv(`exec: ${channel} received ${Deno.inspect(buffer)}`)
			handler(process, arguments[2])
		}
	}
	return stdio[channel]
}

/** Handle stdin channel upon matching prompts */
async function handle(process: Deno.Process, {tracer, channel, stdio, closed, prompts}: listener) {
	if (process.stdin) {
		if (prompts.length) {
			// Search matching prompts
			const prompt = prompts[0]
			if (((!prompt.stdout) && (!prompt.stderr)) || (prompt?.[channel]?.test?.(stdio[channel]))) {
				// Shift prompt and extract it
				const {stdin, stdout, stderr, lf = true, capture = true, amend = false, clean = true, flush = false, close = false} = prompts.shift()!
				const match = stdout ?? stderr
				const cursors = stdio.commands[stdio.commands.length-2]?.at ?? {stdout:0, stderr:0} as cursor
				const previous = stdio.commands[stdio.commands.length-1]
				let matched = ""
				if (match) {
					;({"0": matched} = stdio[channel].substring(cursors[channel]).match(match)!)
					tracer?.vvvv(`exec: ${channel} matched ${match}`)
				}

				// Clean output from match
				if ((matched.length)&&(clean)) {
						stdio[channel] = stdio[channel].replace(matched, "")
						tracer?.vvvv(`exec: ${channel} cleaned out ${Deno.inspect(matched)}`)
				}

				// Flush stdio
				if (flush) {
					Object.assign(stdio, {stdout: "", stderr: ""})
					tracer?.vvvv("exec: flushed stdio")
				}

				// Amend to previous prompt
				if (amend) {
					tracer?.vvvv("exec: amend to previous prompt, calling handler again")
					handle(process, arguments[1])
					return
				}

				// Capture output of previous prompt 
				if (previous) {
					for (const channel of ["stdout", "stderr"] as const) {
						previous[channel] = stdio[channel].substring(cursors[channel])
						previous.at[channel] = stdio[channel].length
						tracer?.vvvv(`exec: command ${Deno.inspect(previous.stdin)} ${channel} ${Deno.inspect(previous[channel])}`)
					}
				}

				// Write to stdin
				if (stdin) {
					const input = lf ? `${stdin}\n` : stdin
					if ((!input.endsWith("\n"))&&(lf !== false))
						tracer?.warning("stdin input does not end with a linefeed, if this is intentional explicitely set lf option to false")
					tracer?.vvvv(`exec: writting ${Deno.inspect(input)} to stdin`)
					await process.stdin.write(encoder.encode(input))
					if (capture)
						stdio.commands.push({stdout: "", stderr: "", stdin, at:{stdout:NaN, stderr:NaN}})
				}

				//Close channel
				if (close) {
					closed[channel] = true
					tracer?.vvvv(`exec: closed ${channel}, any additional content will be discarded`)
				}
			}
		}

		//Close stdin when all prompts were consumed
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
