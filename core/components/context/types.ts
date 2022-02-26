// Imports
import type { Tracer } from "../tracer/mod.ts"

/** Context variables */
export type vars = {it?: {tracer?: Tracer | null}, [key: PropertyKey]: unknown}
