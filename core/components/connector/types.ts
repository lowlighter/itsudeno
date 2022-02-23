// Imports
import type { Escalation } from "../escalation/escalation.ts"

/** Connector options */
export type options = {escalation: Escalation, permissions?: permissions}

/** Deno permissions */
export type permissions = {
	/** All */
	all?: boolean,
	/** High-resolution time */
	hrtime?: boolean,
	/** Plugin */
	plugin?: boolean,
	/** Read */
	read?: boolean | string[],
	/** Write */
	write?: boolean | string[],
	/** Net */
	net?: boolean | string[],
	/** Child processes */
	run?: boolean | string[],
	/** Environment variables */
	env?: boolean | string[],
	/** FFI */
	ffi?: boolean | string[],
}
