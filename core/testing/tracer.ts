//Imports
import {Tracer, TracerEvent} from "../components/tracer/mod.ts"

/** Test tracer */
export class TestTracer extends Tracer {
    handle(event:TracerEvent) {
        this.handled.add(event.data)
    }
    readonly handled = new Set<unknown>()
}