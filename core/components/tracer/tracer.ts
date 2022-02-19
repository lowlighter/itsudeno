// Imports
import { ItsudenoError } from "../../meta/errors.ts"
import { Component } from "../component/component.ts"
import { TracerEvent } from "./event.ts"
import type { level } from "./types.ts"

/** Generic tracer */
export abstract class Tracer extends Component {
	/** Event handler */
	protected abstract handle(event: TracerEvent): void

	/** Emit event */
	#emit({level, data}: {level: level, data: unknown}) {
		this.handle(new TracerEvent({tracer: this, level, data}))
	}

	/** Fatal error channel */
	fatal(data: unknown) {
		this.#emit({level: "fatal", data})
		throw new ItsudenoError.Fatal()
	}

	/** Error channel */
	error(data: unknown) {
		this.#emit({level: "error", data})
	}

	/** Warning channel */
	warning(data: unknown) {
		this.#emit({level: "warning", data})
	}

	/** Deprecation channel */
	deprecation(data: unknown) {
		this.#emit({level: "deprecation", data})
	}

	/** Notice channel */
	notice(data: unknown) {
		this.#emit({level: "notice", data})
	}

	/** Info channel */
	info(data: unknown) {
		this.#emit({level: "info", data})
	}

	/** Log channel */
	log(data: unknown) {
		this.#emit({level: "log", data})
	}

	/** Debug channel */
	debug(data: unknown) {
		this.#emit({level: "debug", data})
	}

	/** Verbose channel 1 (same as debug channel) */
	v(data: unknown) {
		return this.debug(data)
	}

	/** Verbose channel 2 */
	vv(data: unknown) {
		this.#emit({level: "vv", data})
	}

	/** Verbose channel 3 */
	vvv(data: unknown) {
		this.#emit({level: "vvv", data})
	}

	/** Verbose channel 4 */
	vvvv(data: unknown) {
		this.#emit({level: "vvvv", data})
	}
}
