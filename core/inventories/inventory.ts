//Imports
import {Common} from "@core/internal/common"
import {Host} from "@core/inventories"
import type {definition, host} from "@core/inventories"
import {is} from "@tools/is"
import {Logger} from "@tools/log"
import type {strategy} from "@tools/validate"
import argv from "y/string-argv@0.3.1"
import {ItsudenoError} from "@errors"
import {settings} from "@settings"
import type {infered, loose} from "@types"
const log = new Logger(import.meta.url)

/**
 * Vault abstraction
 *
 * This is a common abstraction for all inventories which ensure that all subsequents inventories have required methods.
 */
export abstract class Inventory<raw, args> extends Common<definition, raw> {
  /** Set or update an host by its identifier */
  abstract set(host: string, value: host): Promise<this>

  /** Delete an host */
  abstract delete(key: string): Promise<this>

  /** Query hosts */
  abstract query(query: string | string[]): Promise<string[]>

  /** List hosts */
  async list() {
    await this.ready
    return await this.query("(all)")
  }

  /** Get an host by its identifier */
  async get(key: string) {
    await this.ready
    const queried = await this.query(key)
    const host = queried.shift()!
    if (!this.#instantiated.has(host))
      throw new ItsudenoError.Inventory(`unknown host: ${key}`)
    if (queried.length)
      throw new ItsudenoError.Inventory(`multiple host results when a single one was expected: ${key}`)
    return this.#instantiated.get(host)!
  }

  /** Check if an host is present in inventory */
  async has(key: string) {
    await this.ready
    return Object.keys(await this.query(key)).length > 0
  }

  /** Arguments validator */
  protected async prevalidate(args?: raw, {context, strategy, strict}: {context?: loose, strategy?: strategy, strict?: boolean} = {}) {
    log.v(`${this.name} → prevalidate`)
    return await this.validate<raw, args>(args ?? {} as raw, this.definition.args, {mode: "input", context: {...context, it: {settings}}, strategy, strict}) as infered
  }

  /** Instantiated hosts */
  readonly #instantiated = new Map<string, Host>()

  /** Instantiate an host (or returns it if already instantiated) */
  protected instantiate(key: string, host: host & {name: string}) {
    if (!this.#instantiated.has(key))
      this.#instantiated.set(key, new Host(this, host))
    return this.#instantiated.get(key)!.sync(host)
  }

  /** Queries parser */
  protected parse(queries: string | string[]) {
    const parsed = []
    if (is.string(queries))
      queries = [queries]
    for (const parts of queries.map(q => argv(q) as string[])) {
      parsed.push({
        groups: parts.filter(part => !/^\([\s\S]*\)$/.test(part)).filter(part => part),
        traits: parts.filter(part => /^\([\s\S]*\)$/.test(part)).map(part => part.match(/^\((?<trait>[\s\S]*)\)$/)?.groups?.trait ?? "").filter(part => part),
      })
    }
    return parsed
  }

  /** Open inventory */
  static async open<raw>(args?: raw) {
    const implementation = this.autoload() as {new(args?: raw): Inventory<infered, infered>}
    return await new implementation(args).ready
  }
}
