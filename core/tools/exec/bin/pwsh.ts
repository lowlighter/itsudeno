// Imports
import { settings } from "../../../settings/mod.ts"
import { exec } from "./../exec.ts"
import type { options, prompt, prompts } from "../types.ts"

// ANSI escape code
const ansiec = "\\x1b\\[(?:(?:\\?1[hl])|([0-9]+m))"

/** PowerShell session */
export async function pwsh(commands: Array<string | prompt>, {tracer = null, cwd, env, ansi}: options = {}) {
	// Configure prompts options and wrap command into a session
	const ps1 = settings.tools.exec.ps1
	const prompts = {
		string: new RegExp(`${ps1}${ansiec}`),
		channel: "stdout",
		feedback: {string: `$<stdin>\\r?\\n${ansiec}`, channel: "stdout"},
		list: [{stdout: /PS.*>/, stdin: `function prompt() {"${ps1.substring(0, 1)}"+"${ps1.substring(1)}"}`, capture: false}],
	} as prompts
	for (let i = 0; i < commands.length; i++) {
		const command = commands[i]
		const prompt = typeof command === "string" ? {stdin: command} : command
		if ((typeof prompt.prompt === "undefined") && (typeof prompt.stdout === "undefined") && (typeof prompt.stderr === "undefined"))
			prompt.prompt = true
		if (i === 0)
			prompt.flush = true
		prompts.list.push(prompt)
	}
	prompts.list.push({prompt: true, stdin: "exit $LASTEXITCODE", capture: false, close: true})

	// Launch session
	return exec(`pwsh -NoLogo -NoProfile`, {tracer, prompts, cwd, env, ansi})
}
