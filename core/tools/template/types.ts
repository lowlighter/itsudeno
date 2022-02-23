// Imports
import type { Tracer } from "../../components/tracer/mod.ts"

/** Variables */
export type vars = Record<PropertyKey, unknown>|null

/** Options */
export type options = {
  /** Tracer */
  tracer?:Tracer|null
  /** Inline mode */
  inline?:boolean
  /** Safe mode */
  safe?:boolean
  /** Synchronous execution */
  sync?:boolean
}