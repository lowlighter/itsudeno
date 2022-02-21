// Imports
import argv from "https://cdn.skypack.dev/string-argv@0.3.1"
import { debounce } from "https://deno.land/std@0.123.0/async/debounce.ts"
import type { DebouncedFunction } from "https://deno.land/std@0.123.0/async/debounce.ts"
import { iterateReader } from "https://deno.land/std@0.126.0/streams/conversion.ts"
import { ItsudenoError } from "../../meta/errors.ts"
import type { listener, exec, cursor, command, _prompt } from "./types.ts"
import { stripColor } from "https://deno.land/std@0.123.0/fmt/colors.ts"
import {settings} from "../../settings/mod.ts"
import {escape} from "../regexp/escape.ts"

// Text encoder and decoder
const decoder = new TextDecoder()
const encoder = new TextEncoder()

/** Raw command executor */
export async function exec(command: string, {tracer = null, prompts = {list:[]}, piped = true, bounce = settings.tools.exec.bounce, poll = settings.tools.exec.polling, cwd, env, ansi = false}: exec = {}) {
	let process = undefined as void|Deno.Process
	let handler = undefined as void|DebouncedFunction<[Deno.Process, listener]>
	let polling = NaN
	if ((prompts.list.length)&&(!piped))
		throw new ItsudenoError.Range(`providing prompts requires stdio to be piped`)
	try {
		// Spawn child process
		tracer?.vvvv(`exec: ${command}`)
		process = Deno.run({cmd: argv(command), cwd, env, stdin: prompts.list.length ? "piped" : "null", stdout: piped ? "piped" : "null", stderr: piped ? "piped" : "null"})

		// Prepare stdio handlers
		prompts = {...prompts, list:prompts.list.slice()}
		handler = debounce(handle, bounce)
		const stdio = {stdout: "", stderr: "", commands: [] as command[]}
		const closed = {stdout:false, stderr:false}
		const polled = poller(process, handler, {tracer, stdio, closed, prompts})
		if (piped)
			polling = setInterval(() => polled.next().done ? clearInterval(polling) : null, poll)

		// Wait for execution
		const [{success, code}] = await Promise.all([
			process.status(),
			piped ? listen(process, handler, {tracer, channel: "stdout", stdio, closed, prompts}) : null,
			piped ? listen(process, handler, {tracer, channel: "stderr", stdio, closed, prompts}) : null,
		])
		Object.assign(closed, {stdout:true, stderr:true})

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
		const commands = stdio.commands.map((command) => Object.fromEntries(Object.entries(command).filter(([k]) => !["at"].includes(k))) as Omit<command, "at">)
		return {success, code, ...stdio, commands}
	} catch (error) {
		//Handle errors
		if (error instanceof Deno.errors.NotFound)
			throw new ItsudenoError.Unsupported(`could not find executable: "${argv(command).shift()!}" `)
		throw new ItsudenoError(error)
	} finally {
		//Clean resources
		if (polling)
			clearInterval(polling)
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

/** Poll channel when they're inactive */
function *poller(process: Deno.Process, handler: DebouncedFunction<[Deno.Process, listener]>, {tracer, stdio, closed, prompts}:Omit<listener, "channel">) {
	for (let index = 0;;index++) {
		//Skip polling if handler is already pending
		if (handler?.pending)
			yield

		//Filter open channels and select one 
		const channels = Object.entries(closed).filter(([_, v]) => !v).map(([k]) => k) as Array<"stdout"|"stderr">
		if (!channels.length)
			return
		const channel = channels[index%channels.length]

		//Call handler
		tracer?.vvvv(`exec: polling for ${channel}`)
		handler?.(process!, {tracer, channel, stdio, closed, prompts})
		yield
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
		if (prompts.list.length) {
			// Search matching prompts
			const prompt = prompts.list[0] as _prompt	
			if (((!prompt.stdout) && (!prompt.stderr) && (!prompt.prompt)) || (prompt?.[channel]?.test?.(stdio[channel])) || ((prompt.prompt)&&(prompts.channel === channel)&&(prompts.string?.test(stdio[channel]))) ) {
				// Shift prompt and extract it
				if (prompt.on) {
					tracer?.vvvv("exec: calling prompt listener")
					prompt.on({tracer:tracer ?? null, prompts, stdio})
				}
				const {stdin, stdout, stderr, lf = true, capture = true, amend = false, clean = true, flush = false, close = false, feedback = true} = prompts.list.shift()! as _prompt
				const match = prompt.prompt ? prompts.string! : stdout ?? stderr
				const cursors = stdio.commands[stdio.commands.length-2]?.at ?? {stdout:0, stderr:0} as cursor
				const previous = stdio.commands[stdio.commands.length-1]
				let matched = ""
				if (match) {
					;({"0": matched} = stdio[channel].substring(cursors[channel]).match(match) ?? [""])
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

				// Capture output of previous prompt 
				if ((previous)&&(!amend)) {
					previous.end = Date.now()
					previous.duration = previous.end - previous.start
					for (const channel of ["stdout", "stderr"] as const) {
						previous[channel] = stdio[channel].substring(cursors[channel])
						previous.at[channel] = stdio[channel].length
						tracer?.vvvv(`exec: command ${Deno.inspect(previous.stdin)} ${channel} ${Deno.inspect(previous[channel])}`)
					}
					tracer?.vvvv(`exec: command ${Deno.inspect(previous.stdin)} completed in ${previous.duration} ms`)
				}

				// Write to stdin
				if (stdin) {
					const input = lf ? `${stdin}\n` : stdin
					tracer?.vvvv(`exec: writting ${Deno.inspect(input)} to stdin`)
					await process.stdin.write(encoder.encode(input))

					// Clean out command feedback
					if ((prompts.feedback)&&(feedback)) {
						const regex = new RegExp(prompts.feedback.string.replaceAll("$<stdin>", escape(stdin)))
						prompts.list.unshift({[prompts.feedback.channel]:regex, capture:false, amend:true})
						tracer?.vvvv(`exec: ${prompts.feedback.channel} cleaned out ${Deno.inspect(regex)} (command feedback is enabled)`)
					}

					// Amend to previous prompt
					if (amend) {
						tracer?.vvvv("exec: amend to previous prompt, calling handler again")
						handle(process, arguments[1])
						return
					}

					//Start capturing 
					if (capture)
						stdio.commands.push({stdout: "", stderr: "", stdin, start:Date.now(), end:NaN, duration:NaN, at:{stdout:NaN, stderr:NaN}})
				}

				//Close channels
				if (close) {
					Object.assign(closed, {stdout:true, stderr:true})
					tracer?.vvvv(`exec: closed channels, any additional content will be discarded`)
				}
			}
		}

		//Close stdin when all prompts were consumed
		if (!prompts.list.length) {
			try {
				process.stdin.close()
				tracer?.vvvv("exec: no remaining prompts, closed stdin")
			} catch {
				// No-op
			}
		}
	}
}
