// Imports
import type { Tracer } from "../../components/tracer/mod.ts"

/** Prompt */
export type prompt = {stdin?: string, stderr?: RegExp, stdout?: RegExp, capture?: boolean, clean?: boolean, flush?: boolean}

/** Execution options */
export type options = {tracer?: Tracer | null, prompts?: prompt[], piped?: boolean, cwd?: string, env?: {[key: string]: string}, bounce?: number}

export type listener = {
	tracer?: Tracer | null,
	channel: "stdout" | "stderr",
	stdio: {stdout: string, stderr: string, captured: Array<{stdout: string, stderr: string, stdin: string}>},
	cursors: {stdout: number, stderr: number},
	prompts: prompt[],
	bounce: number,
}
