//Imports
import type {host, Inventory} from "@core/inventories"
import {ItsudenoError} from "@errors"
import type {infered} from "@types"

/**
 * Inventory host.
 *
 * This is an abstraction of an host and contains various methods for easier management.
 */
export class Host {
  /** Constructor */
  constructor(inventory: Inventory<infered, infered> | null, {name, executors = {}, data = {}, groups = []}: host & {name: string}) {
    this.#inventory = inventory
    this.name = name
    this.data = data
    this.executors = executors
    this.groups = [...new Set(groups)] as string[]
  }

  /** Name */
  readonly name

  /** Data */
  readonly data

  /** Groups */
  readonly groups

  /** Executors */
  readonly executors

  /** Sync host */
  sync({data, groups, executors}: host) {
    Object.assign(this, {data, groups, executors})
    return this
  }

  /** Save host */
  async save() {
    if (!this.#inventory)
      throw new ItsudenoError.Inventory("cannot save host as it was instantiated without inventory")
    await this.#inventory.set(this.name, this)
    return this.#inventory.get(this.name)
  }

  /** Inventory */
  readonly #inventory: Inventory<infered, infered> | null

  /** Localhost */
  static readonly local = new Host(null, {name: "(localhost)"})
}
