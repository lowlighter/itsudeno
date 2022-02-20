// Imports
import type { Tracer } from "../../components/tracer/mod.ts"

/** Prompt */
export type prompt = {stdin?: string, stderr?: RegExp, stdout?: RegExp, lf?:boolean, capture?: boolean, clean?: boolean, flush?: boolean, close?:boolean, amend?:boolean}

/** Cursor */
export type cursor = {stdout:number, stderr:number}

/** Command captured content */
export type command = {stdout: string, stderr: string, stdin: string, at:cursor}

/** Execution options */
export type exec = options & {prompts?: prompt[], piped?: boolean, bounce?: number}

/** Shell options */
export type options = {tracer?: Tracer | null, cwd?: string, env?: {[key: string]: string}, ansi?:boolean}

/** Listener options */
export type listener = {
	tracer?: Tracer | null,
	channel: "stdout" | "stderr",
	stdio: {stdout: string, stderr: string, commands: command[]},
	closed:{stdout:boolean, stderr:boolean}
	prompts: prompt[],
}
