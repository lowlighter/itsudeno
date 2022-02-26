// Imports
import type { TracerEvent } from "./event.ts"
import type { Tracer } from "./tracer.ts"

/** Tracer event */
export type event = {
	/** Tracer */
	tracer: Tracer,
	/** Event level */
	level: level,
	/** Data */
	data: unknown,
}

/** Tracer event level */
export type level = keyof typeof TracerEvent.level
