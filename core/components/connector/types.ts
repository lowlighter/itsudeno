// Imports
import type { Escalation } from "../escalation/escalation.ts"

/** Connector handle */
export type handle = {
	/** Escalation */
	escalation: Escalation,
	/** Command to execute */
	command: string,
}

/** Connector options */
export type options = {
	/** Escalation */
	escalation: Escalation,
	/** Deno permissions */
	permissions?: permissions,
	/** Current working directory */
	cwd?: string,
	/** Environment variables */
	env?: Record<string, string>,
}

/** Deno permissions */
export type permissions = {
	/** All */
	all?: boolean,
	/** High-resolution time */
	hrtime?: boolean,
	/** Plugin */
	plugin?: boolean,
	/** Read */
	read?:
		| boolean
		| string[],
	/** Write */
	write?:
		| boolean
		| string[],
	/** Net */
	net?:
		| boolean
		| string[],
	/** Child processes */
	run?:
		| boolean
		| string[],
	/** Environment variables */
	env?:
		| boolean
		| string[],
	/** FFI */
	ffi?: boolean | string[],
}
