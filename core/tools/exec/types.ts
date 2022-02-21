// Imports
import type { Tracer } from "../../components/tracer/mod.ts"
import type { XOR } from "../../meta/types.ts"

/** Prompts */
export type prompts = {
	/** Prompt string matcher */
	string?:RegExp
	/** Prompt string channel */
	channel?:"stdout"|"stderr"
	/** Feedback from stdin */
	feedback?:{
		/** Feedback from pattern (use $<stdin> to indicate content written from stdin) */
		string:string,
		/** Feeback channel */
		channel:"stdout"|"stderr"
	}
	/** Prompts */
	list:prompt[]
}

/** Prompt input */
export type prompt = {
	/** Content to write on stdin */
	stdin?: string, 
	/** Append a linefeed at the end of stdin (simulate enter key) */
	lf?:boolean,
	/** Is stdin rewritten over feedback channel */
	feedback?: boolean
	/** Clean out content matchers from stdio */
	clean?: boolean,
	/** Flush stdio content */
 	flush?: boolean, 
	/** Close stdio channels */
 	close?:boolean
	/** Listener */
	on?:(args:{tracer:Tracer|null, prompts:prompts, stdio:stdio}) => void
}
& XOR<[
	Record<never, never> , {
	/** Capture content from stdio */
	capture: boolean, 
	}, {
	/** Amend content from stdio to previous command */
	amend:boolean,
	/** Capture content from stdio */
	capture: false, 
	}
]>
& XOR<[
	Record<never, never> , {
	/** Content matcher for stdout */
	stdout: RegExp
} , {
	/** Content matcher for stderr */
	stderr: RegExp
} , {
	/** Prompt string matcher */
	prompt: boolean
}]>

/** Prompt input (internal) */
export type _prompt = prompt & {
	/** Prompt string matcher */
	prompt?: boolean, 
	/** Content matcher for stdout */
	stdout?: RegExp, 
	/** Content matcher for stderr */
	stderr?: RegExp, 
	/** Capture content from stdio */
	capture?: boolean, 
	/** Amend content from stdio to previous command */
	amend?:boolean,
} 

/** Cursor */
export type cursor = {
	/** Cursor position of stdout */
	stdout:number, 
	/** Cursor position of stderr */
	stderr:number
}

/** Command captured content */
export type command = {
	/** Content from stdin */
	stdin: string,
	/** Content from stdout */
	stdout: string, 
	/** Content from stderr */
	stderr: string,  
	/** Command start */
	start: number,
	/** Command end */
	end:number
	/** Command duration */
	duration:number
	/** Cursors for stdio */
	at:cursor
}

/** Content from stdio */
export type stdio = {
	/** Content from stdout */
	stdout: string, 
	/** Content from stderr */
	stderr: string, 
	/** Captured content from commands */
	commands: command[]
}

/** Execution options */
export type exec = options & {
	/** Prompts */
	prompts?: prompts,
	/** Is stdio piped */ 
	piped?: boolean, 
	/** Bounce (ms) for stdio handler */
	bounce?: number
	/** Poll (ms) for stdio handler */
	poll?:number
}

/** Shell options */
export type options = {
	/** Tracer */
	tracer?: Tracer | null, 
	/** Current working directory */
	cwd?: string, 
	/** Environment variables */
	env?: {[key: string]: string}, 
	/** Keep ANSI escape code */	
	ansi?:boolean
}

/** Listener options */
export type listener = {
	/** Tracer */
	tracer?: Tracer | null,
	/** Listened channel */
	channel: "stdout" | "stderr",
	/** Content from stdio */
	stdio: stdio
	/** Are channels closed */
	closed:{
		/** Is stdout closed */
		stdout:boolean, 
		/** Is stderr closed */
		stderr:boolean
	}
	/** Prompts */
	prompts: prompts
}
