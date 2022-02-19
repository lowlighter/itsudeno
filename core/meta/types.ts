// deno-lint-ignore no-explicit-any
export type notyping = any

/** Friend accessor (use this to access private fields) */
export type friend = notyping

/** Constructor */
export type constructor<T> = T & {new(...args: unknown[]): T}
