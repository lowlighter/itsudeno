// Imports
import { Tracer, TracerEvent } from "../components/tracer/mod.ts"
import { gray, stripColor } from "https://deno.land/std@0.123.0/fmt/colors.ts"

/** Test tracer */
export class TestTracer extends Tracer {
	handle(event: TracerEvent) {
		this.handled.add(event.data)
		//Deno.stdout.write(new TextEncoder().encode(gray(stripColor(`\n${event}`))))
	}
	readonly handled = new Set<unknown>()
}
