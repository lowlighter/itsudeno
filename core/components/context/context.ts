// Imports
import { Component } from "../component/mod.ts"
import type { vars } from "./types.ts"

/** Context */
export class Context extends Component {
	/** Constructor */
	constructor(meta = import.meta.url, id = "") {
		super(meta, id)
		Object.assign(this, {context: this})
	}

	/** Parent context */
	protected readonly parent = null as
		| Context
		| null

	/** Depth */
	protected readonly depth = 0

	/** Context variables (internal) */
	#vars = {it: {scope: "global"}} as vars

	/** Context variables */
	get vars(): vars {
		return {...this.parent?.vars, ...this.#vars}
	}

	/** Create a new context with new context variables */
	async with(vars: vars) {
		const depth = this.depth + 1
		const context = await new Context(this.meta, `${this.id}-${depth}`).ready
		Object.assign(context, {parent: this, depth})
		context.#vars = vars
		return context
	}
}