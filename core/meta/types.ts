/** Disable typing */
// deno-lint-ignore no-explicit-any
export type notyping = any

/** Friend accessor (use this to access private fields) */
export type friend = notyping

/** Constructor */
export type constructor<T> =
	& T
	& {new(...args: unknown[]): T}

/** Without type */
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }

/** XOR (internal) */
type _XOR<T, U> = (T | U) extends Record<PropertyKey, unknown> ? (Without<T, U> & U) | (Without<U, T> & T) : 
	| T
	| U

/** XOR */
export type XOR<T extends notyping[]> = T extends [infer Only] ? Only : T extends [infer A, infer B, ...infer Rest] ? XOR<[_XOR<A, B>, ...Rest]> : never
