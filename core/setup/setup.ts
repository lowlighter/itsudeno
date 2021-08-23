//Imports
import type {Executor} from "@core/executors"
import type {Inventory} from "@core/inventories"
import type {Reporter} from "@core/reporters"
import type {Vault} from "@core/vaults"
import {is} from "@tools/is"
import {ItsudenoError} from "@errors"
import {Executors} from "@executors"
import {Inventories} from "@inventories"
import {Reporters} from "@reporters"
import {settings} from "@settings"
import type {infered} from "@types"
import {Vaults} from "@vaults"

//Load executors
const executors = new Proxy({} as {[key: string]: Executor<infered, infered>}, {
  get(target, property) {
    if ((Reflect.has(target, property)) || (is.symbol(property)))
      return Reflect.get(target, property)
    throw new ItsudenoError.Executor(`unknown unregistered executor: ${property}`)
  },
})
if (settings.executors) {
  const loaded = [] as Array<[string, Executor<infered, infered>]>
  for (const [name, {type, ...args}] of Object.entries(settings.executors)) {
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
  const loaded = [] as Array<[string, Inventory<infered, infered>]>
  for (const [name, {type, ...args}] of Object.entries(settings.inventories)) {
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
  const loaded = [] as Array<[string, Vault<infered, infered>]>
  for (const [name, {type, ...args}] of Object.entries(settings.vaults)) {
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
  const loaded = [] as Array<[string, Reporter<infered, infered>]>
  for (const [name, {type, ...args}] of Object.entries(settings.reporters)) {
    if (!(type in Reporters))
      throw new ItsudenoError.Reporter(`could not load reporter: ${name} (unknown type: ${type})`)
    loaded.push([name, await Reporters[type as keyof typeof Reporters].open(args)])
  }
  Object.assign(reporters, Object.fromEntries(loaded), {default: loaded[0][1]})
}

/** Configured itsudeno instance */
export const it = {
  settings,
  executors,
  inventories,
  vaults,
  reporters,
} as const