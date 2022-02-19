/** Generic itsudeno error */
export class ItsudenoError extends Error {
	/** Unsupported error */
	static readonly Unsupported = class ItsudenoUnsupportedError extends ItsudenoError {}

	/** Fatal error */
	static readonly Fatal = class ItsudenoFatalError extends ItsudenoError {}

	/** Reference error */
	static readonly Reference = class ItsudenoReferenceError extends ItsudenoError {}

	/** Connector error */
	static readonly Connector = class ItsudenoConnectorError extends ItsudenoError {}
}
