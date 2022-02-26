// Imports
import type { notyping } from "./types.ts"

/** Generic itsudeno error */
export class ItsudenoError extends Error {
	/** Constructor */
	constructor(..._: unknown[]) {
		super(...arguments)
		this.name = this.constructor.name
		this.stack = this.message
	}

	/** Unsupported error */
	static readonly Unsupported = class ItsudenoUnsupportedError extends ItsudenoError {}

	/** Fatal error */
	static readonly Fatal = class ItsudenoFatalError extends ItsudenoError {}

	/** Reference error */
	static readonly Reference = class ItsudenoReferenceError extends ItsudenoError {}

	/** Range error */
	static readonly Range = class ItsudenoRangeError extends ItsudenoError {}

	/** Type error */
	static readonly Type = class ItsudenoTypeError extends ItsudenoError {}

	/** Template error */
	static readonly Template = class TemplateError extends ItsudenoError {}

	/** Connector error */
	static readonly Connector = class ItsudenoConnectorError extends ItsudenoError {}
}

/** Throws error */
export function throws(error: Error): notyping {
	throw error
}
