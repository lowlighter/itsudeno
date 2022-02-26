// Imports
import { deferred } from "https://deno.land/std@0.123.0/async/deferred.ts"
import { esm } from "../../meta/esm.ts"
import type { constructor } from "../../meta/types.ts"
import type { Context } from "../context/mod.ts"
import type { definition } from "../definition/mod.ts"
import type { Tracer } from "../tracer/mod.ts"

/** Component */
export class Component {
	/** Constructor */
	constructor(meta = import.meta.url, id = "") {
		this.meta = meta
		this.module = esm(meta, {dir: true})
		this.id = id
		this.setup()
	}

	/** ES module meta url */
	protected readonly meta

	/** ES module path */
	readonly module

	/** Identifier */
	readonly id

	/** Context */
	protected readonly context = null as
		| Context
		| null

	/** Ready state */
	readonly ready = deferred<this>()

	/** Asynchronous setup */
	protected async setup() {
		this.ready.resolve(this)
	}

	/** String representation */
	toString() {
		return `[${this.id} ${this.constructor.name}]`
	}

	/** Definition */
	get definition(): definition {
		return (this.constructor as constructor<Component>).definition
	}

	/** Tracer */
	protected get tracer(): Tracer | null {
		return this.context?.vars?.it?.tracer ?? null
	}

	/** Definition */
	static readonly definition = null as unknown as definition
}
