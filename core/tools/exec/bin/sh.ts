//Imports
import {exec} from "./../exec.ts"
import type {options, prompt, prompts} from "../types.ts"
import {settings} from "../../../settings/mod.ts"

/** Shell session */
export async function sh(commands:Array<string|prompt>, {tracer = null, cwd, env, ansi}:options = {}) {
	// Configure prompts options and wrap command into a session
	const ps1 = settings.tools.exec.ps1
	const prompts = {
		string:new RegExp(ps1),
		channel:"stderr",
		list:[{stdin: `PS1=${ps1}`, capture: false, flush: true}]
	} as prompts
	for (let i = 0; i < commands.length; i++) {
    const command = commands[i]
		const prompt = typeof command === "string" ? {stdin:command} : command
		if ((typeof prompt.prompt === "undefined")&&(typeof prompt.stdout === "undefined")&&(typeof prompt.stderr === "undefined"))
			prompt.prompt = true
		prompts.list.push(prompt)
  }
	prompts.list.push({prompt:true, stdin:"exit $?", feedback:false, capture: false, close:true})

	//Launch session
  return exec(`sh -i`, {tracer, prompts, cwd, env, ansi})
}
