//deno-lint-ignore no-explicit-any
type notyping = any

/** Friend class (used to access protected and private properties of a class) */
export type friend = notyping

/** Test accessor (used in tests to disable typing) */
export type test = notyping

/** Read-write (used to overwrite readonly property) */
export type rw = notyping

/** Uninitialized value (used for deferred constructors) */
export type uninitialized = unknown

/** Infered typing */
export type infered = notyping

/** Loose type */
export type loose = {[key: string]: unknown}

/** Primitive type */
export type primitive = string | number | boolean

/** Constructor */
export interface constructor<T = infered> {
  new(): T
}
