//Imports
import {exec} from "./../exec.ts"
import type {options} from "../types.ts"

/** Shell session */
export async function sh(commands:string|string[], {tracer = null, cwd, env, ansi}:options = {}) {
	//Create session 
	const ps1 = `itsudeno_${crypto.randomUUID()}`
	tracer?.vvvv(`sh: created session ${ps1}`)

	// Set prompt string, enter commands and close upon next prompt
	const prompt = new RegExp(ps1)
	const prompts = [
		{stdin: `PS1=${ps1}`, capture: false, flush: true},
		...([commands].flat()).map(command => ({stderr:prompt, stdin:command})),
		{stderr: prompt, capture: false, close:true},
	]

	//Launch session
  return exec(`sh -i`, {tracer, prompts, cwd, env, ansi})
}
