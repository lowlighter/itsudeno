//Imports
import type {Tracer} from "./tracer.ts"
import type {TracerEvent} from "./event.ts"

/** Tracer event */
export type event = {tracer:Tracer, level:level, data:unknown}

/** Tracer event level */
export type level = keyof typeof TracerEvent.level