//Imports
import type {Executor} from "@core/executors"
import type {Inventory} from "@core/inventories"
import type {Reporter} from "@core/reporters"
import type {Vault} from "@core/vaults"
import {cli} from "@interfaces/cli"
import {is} from "@tools/is"
import {Logger} from "@tools/log"
import {ItsudenoError} from "@errors"
import {Executors} from "@executors"
import {Inventories} from "@inventories"
import {Reporters} from "@reporters"
import {settings} from "@settings"
import type {infered, loose} from "@types"
import {Vaults} from "@vaults"
const log = new Logger(import.meta.url)

//Load executors
const executors = new Proxy({} as {[key: string]: Executor<infered, infered>}, {
  get(target, property) {
    if ((Reflect.has(target, property)) || (is.symbol(property)))
      return Reflect.get(target, property)
    throw new ItsudenoError.Executor(`unknown unregistered executor: ${property}`)
  },
})
if (settings.executors) {
  log.vvv(`preparing defined executors`)
  const loaded = [] as Array<[string, Executor<infered, infered>]>
  for (const [name, {type, ...args}] of Object.entries<{type: string} & loose>(settings.executors)) {
    if (!(type in Executors))
      throw new ItsudenoError.Executor(`could not load executor: ${name} (unknown type: ${type})`)
    loaded.push([name, await Executors[type as keyof typeof Executors].prepare(args)])
  }
  Object.assign(executors, Object.fromEntries(loaded), {default: loaded[0][1]})
}

//Load inventories
const inventories = new Proxy({} as {[key: string]: Inventory<infered, infered>}, {
  get(target, property) {
    if ((Reflect.has(target, property)) || (is.symbol(property)))
      return Reflect.get(target, property)
    throw new ItsudenoError.Inventory(`unknown unregistered inventory: ${property}`)
  },
})
if (settings.inventories) {
  log.vvv(`preparing defined inventories`)
  const loaded = [] as Array<[string, Inventory<infered, infered>]>
  for (const [name, {type, ...args}] of Object.entries<{type: string} & loose>(settings.inventories)) {
    if (!(type in Inventories))
      throw new ItsudenoError.Inventory(`could not load inventory: ${name} (unknown type: ${type})`)
    loaded.push([name, await Inventories[type as keyof typeof Inventories].open(args)])
  }
  Object.assign(inventories, Object.fromEntries(loaded), {default: loaded[0][1]})
}

//Load vaults
const vaults = new Proxy({} as {[key: string]: Vault<infered, infered>}, {
  get(target, property) {
    if ((Reflect.has(target, property)) || (is.symbol(property)))
      return Reflect.get(target, property)
    throw new ItsudenoError.Vault(`unknown unregistered vault: ${property}`)
  },
})
if (settings.vaults) {
  log.vvv(`preparing defined vaults`)
  const loaded = [] as Array<[string, Vault<infered, infered>]>
  for (const [name, {type, ...args}] of Object.entries<{type: string} & loose>(settings.vaults)) {
    if (!(type in Vaults))
      throw new ItsudenoError.Vault(`could not load vault: ${name} (unknown type: ${type})`)
    loaded.push([name, await Vaults[type as keyof typeof Vaults].open(args)])
  }
  Object.assign(vaults, Object.fromEntries(loaded), {default: loaded[0][1]})
}

//Load reporters
const reporters = new Proxy({} as {[key: string]: Reporter<infered, infered>}, {
  get(target, property) {
    if ((Reflect.has(target, property)) || (is.symbol(property)))
      return Reflect.get(target, property)
    throw new ItsudenoError.Reporter(`unknown unregistered reporter: ${property}`)
  },
})
if (settings.reporters) {
  log.vvv(`preparing defined reporters`)
  const loaded = [] as Array<[string, Reporter<infered, infered>]>
  for (const [name, {type, ...args}] of Object.entries<{type: string} & loose>(settings.reporters)) {
    if (!(type in Reporters))
      throw new ItsudenoError.Reporter(`could not load reporter: ${name} (unknown type: ${type})`)
    loaded.push([name, await Reporters[type as keyof typeof Reporters].open(args)])
  }
  Object.assign(reporters, Object.fromEntries(loaded), {default: loaded[0][1]})
}

log.vvv(`setup completed`)

/** Configured itsudeno instance */
export const it = {
  settings,
  executors,
  inventories,
  vaults,
  reporters,
  cli,
  inspect(x: unknown) {
    return Deno.inspect(x, {depth: Infinity, getters: true})
  },
} as const
