//Imports
import {exec} from "./../exec.ts"
import {escape} from "../../regexp/escape.ts"
import type {prompt, options} from "../types.ts"

/** PowerShell session */
export async function pwsh(commands:string|string[], {tracer = null, cwd, env, ansi}:options = {}) {
	//Create session 
	const ps1 = `itsudeno_${crypto.randomUUID()}`
	tracer?.vvvv(`sh: created session ${ps1}`)

  //Set prompt string, enter commands (and clean them from stdout as they're written) and close upon next prompt
  const prompts = [{stdout:/PS.*>/, stdin: `function prompt() {"${ps1.substring(0, 8)}"+"${ps1.substring(8)}"}`, capture: false}] as prompt[]
  commands = [commands].flat()
  const ansiec = "\\x1b\\[(?:(?:\\?1[hl])|([0-9]+m))"
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i]
    prompts.push({stdout:new RegExp(`${ps1}${ansiec}`), stdin:command, flush: i === 0})
    prompts.push({stdout:new RegExp(`${escape(command)}\\n${ansiec}`), capture:false, amend:true})
  }
  prompts.push({stdout:new RegExp(`${ps1}${ansiec}`), stdin:"exit $LASTEXITCODE", capture:false, close:true})

	//Launch session
  return exec(`pwsh -NoLogo -NoProfile`, {tracer, prompts, cwd, env, ansi})
}
