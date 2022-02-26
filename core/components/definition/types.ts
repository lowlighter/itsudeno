// Imports
import type { to } from "./typing/mod.ts"

/** Component definition */
export type definition = {
	/** Component name */
	name: string,
	/** Component description */
	description: string,
	/** Component inputs */
	inputs:
		| Record<string, input>
		| null,
	/** Component outputs */
	outputs:
		| Record<string, output>
		| null,
	/** Supported operating systems */
	for: Array<typeof Deno.build.os>,
}

/** Entry */
type entry<T extends (input | output)> = {
	/** Description */
	description: string,
	/** Type */
	type:
		| keyof typeof to
		| Record<string, T>,
	/** Type constraints */
	validates?: Array<(...args: unknown[]) => boolean>,
	/** Examples */
	examples?: unknown[],
	/** Deprecation message */
	deprecated?:
		| string
		| false,
	/** Overrides by operating systems */
	on?: Record<typeof Deno.build.os, Partial<T>>,
}

/** Input */
export interface input extends entry<input> {
	/** Required input */
	required?: boolean
	/** Default value */
	defaults?: unknown
	/** Aliases */
	aliases?: string[]
	/** Conflicting inputs */
	conflicts?: string[]
	/** Dependent inputs */
	depends?: string[]
}

/** Output */
export interface output extends entry<output> {
	/** Optional output */
	optional?: boolean
}
