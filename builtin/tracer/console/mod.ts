// Imports
import { bgRed, bgYellow, cyan, gray, magenta, red, white, yellow } from "https://deno.land/std@0.123.0/fmt/colors.ts"
import { Tracer, TracerEvent } from "../../../core/components/tracer/mod.ts"

/** Console tracer */
export default class ConsoleTracer extends Tracer {
	/** Constructor */
	constructor(id = "") {
		super(import.meta.url, id)
	}

	/** Event handler */
	handle(event: TracerEvent) {
		switch (event.level) {
			case "fatal":
				return console.error(bgRed(white(`${event}`)))
			case "error":
				return console.error(red(`${event}`))
			case "warning":
				return console.warn(yellow(`${event}`))
			case "deprecation":
				return console.warn(bgYellow(white(`${event}`)))
			case "notice":
				return console.info(magenta(`${event}`))
			case "info":
				return console.info(cyan(`${event}`))
			case "log":
				return console.log(white(`${event}`))
			case "debug":
			case "v":
			case "vv":
			case "vvv":
			case "vvvv":
				return console.debug(gray(`${event}`))
		}
	}
}
