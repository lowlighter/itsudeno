//Imports
import type {event} from "./types.ts"
import type {friend} from "../../meta/types.ts"

/** Tracer event */
export class TracerEvent {

  /** Constructor */
  constructor({tracer, level, data}:event) {
    this.#tracer = tracer
    this.level = level
    this.data = data
    this.timestamp = Date.now()
    Object.freeze(this)
  }

  /** Tracer */
  readonly #tracer

  /** Level */
  readonly level

  /** Data */
  readonly data

  /** Timestamp */
  readonly timestamp

  /** String representation */
  toString() {
    const date = new Date(this.timestamp).toISOString()
    const meta = [date, this.level, (this.#tracer as friend).context?.vars?.it?.scope, this.#tracer.id].filter(part => part).map(part => `[${part}]`).join(" ").trim()
    return `${meta} ${Deno.inspect(this.data, {colors:true, depth:Infinity})}`.trim()
  }

  /** Levels numeric values */
  static readonly level = Object.freeze({
    fatal:0.1,
    error:0.2,
    warning:1.1,
    deprecation:1.2,
    notice:2.1,
    info:2.2,
    log:3.1,
    debug:4.1,
    v:4.1,
    vv:4.2,
    vvv:4.3,
    vvvv:4.4,
  })

}