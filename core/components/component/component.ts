//Imports
import {deferred} from "std/async/deferred.ts"
import {esm} from "core/meta/esm.ts"
import type {definition} from "core/components/component/types.ts"
import type {constructor} from "core/meta/types.ts"
import type {Context} from "core/components/context/context.ts"

/** Component */
export class Component {

  /** Constructor */
  constructor(meta = import.meta.url, id = "") {
    this.meta = meta
    this.module = esm(meta, {dir:true})
    this.id = id
    this.setup()
  }

  /** ES module meta url */
  readonly meta

  /** ES module path */
  readonly module

  /** Identifier */
  readonly id

  /** Context */
  readonly context = null as Context|null

  /** Ready state */
  readonly ready = deferred<this>()

  /** Asynchronous setup */
  async setup() {
    this.ready.resolve(this)
  }

  /** String representation */
  toString() {
    return `[${this.id} ${this.constructor.name}]`
  }

  /** Definition */
  get definition():definition {
    return (this.constructor as constructor<Component>).definition
  }

  /** Definition */
  static readonly definition = null as unknown as definition

}
