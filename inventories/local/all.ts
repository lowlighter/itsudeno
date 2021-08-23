//Imports
import type {host} from "@core/inventories"
import {Inventory} from "@generated/inventories/local/it.ts"
import type {raw} from "@generated/inventories/local/it.ts"
import {Logger} from "@tools/log"
import Datastore from "x/dndb@0.3.3/mod.ts"
import type {loose, uninitialized} from "@types"
const log = new Logger(import.meta.url)

/** Generic implementation */
Inventory.register(
  import.meta.url,
  class extends Inventory {
    /** Perform async initialization */
    async async(raw: raw) {
      const {path} = await this.prevalidate(raw)
      this.#inventory = new Datastore({filename: path, autoload: true})
      return super.async()
    }

    /** Set or update an host by its identifier */
    async set(key: string, {groups, data, executors}: host) {
      await this.ready
      if (await this.has(key)) {
        log.vv(`updating host: ${key}`)
        const update = {} as loose
        if (groups)
          update.g = groups
        if (data)
          update.d = data
        if (executors)
          update.e = executors
        await this.#inventory.updateOne({k: key}, {$set: update})
      }
      else {
        log.vv(`creating host: ${key}`)
        await this.#inventory.insert({k: key, g: groups ?? [], d: data ?? {}, e: executors ?? {}})
      }
      return this
    }

    /** Delete an host */
    async delete(key: string) {
      await this.ready
      log.vv(`deleting host: ${key}`)
      await this.#inventory.removeOne({k: key})
      return this
    }

    /** Query hosts */
    async query(queries: string | string[]) {
      const hosts = new Set<string>()
      const queried = this.parse(queries)
      for (const {groups} of queried) {
        //Seems there are some issues with dndb so the filtering below is not optimized, but ideally $all should be used
        await Promise.all(
          [...await this.#inventory.find({}) as Array<{k: string, g: string[], d: loose, e: loose}>]
            .filter(({k, g}) => groups.includes(k) || groups.every(group => g.includes(group)))
            .map(({k, g, d, e}) => hosts.add(this.instantiate(k, {name: k, groups: g, data: d, executors: e}).name)),
        )
      }
      log.vvv(`found ${hosts.size} results for query ${JSON.stringify(queried)}`)
      return [...hosts].sort()
    }

    /** Local inventory */
    #inventory = null as uninitialized as Datastore
  },
)
