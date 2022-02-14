//Imports
import type {Tracer} from "core/components/tracer/tracer.ts"
import type {TracerEvent} from "core/components/tracer/event.ts"

/** Tracer event */
export type event = {tracer:Tracer, level:level, data:unknown}

/** Tracer event level */
export type level = keyof typeof TracerEvent.level