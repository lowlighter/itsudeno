//Imports
import {Host} from "@core/inventories"
import {it} from "@core/setup"
import {Logger} from "@tools/log"
import {access} from "@tools/objects"
import {stringify} from "std/encoding/yaml.ts"
import {gray, italic} from "std/fmt/colors.ts"
import {Confirm} from "x/cliffy@v0.19.5/mod.ts"
import {ItsudenoError} from "@errors"
import type {infered} from "@types"
const log = new Logger(import.meta.url)

/** Cli bindings */
export const cli = {
  /** Get hosts */
  async get({inventory = "default"}, targets = []) {
    //Query hosts
    const hosts = await it.inventories[inventory].query(targets)
    if (!hosts.length) {
      console.log(italic(gray("(no hosts matched)")))
      return
    }

    //Print hosts
    console.log(stringify(hosts as infered))
  },
  /** Set hosts */
  async set({inventory = "default", property: properties = [], deleteProperty: deletedProperties = [], group: groups = [], deleteGroup: deletedGroups = [], add = false, yes = false}, targets = []) {
    //Query hosts
    const hosts = []
    if ((targets.length) && (add)) {
      const names = new Set(targets)
      if (names.size < targets.length)
        log.warn(`some hosts were specified multiple times, ignoring...`)
      for (const name of names) {
        if (await it.inventories[inventory].has(name))
          throw new ItsudenoError.Inventory(`host already exists: ${name}`)
        hosts.push(new Host(it.inventories[inventory], {name}))
      }
    }
    else {
      hosts.push(...await Promise.all([...await it.inventories[inventory].query(targets)].map(host => it.inventories[inventory].get(host))))
      if (!hosts.length)
        throw new ItsudenoError.Inventory("no hosts matched")
    }

    //User confirmation
    if ((!yes) && (!await Confirm.prompt(`The following hosts will be updated, confirm changes?\n${hosts.map(({name}) => `  - ${name}`).join("\n")}\n`)))
      throw new ItsudenoError.Aborted("operation aborted by user")

    //Update hosts
    properties.push(...deletedProperties)
    groups.push(...deletedGroups)
    for (const host of hosts) {
      //Set properties
      for (const {action, key, value} of properties) {
        switch (action) {
          case "set": {
            access(host.data, key, {set: value})
            log.vvv(`${host.name}: ${key} set to ${value}`)
            continue
          }
          case "delete": {
            access(host.data, key, {set: null, deleted: true})
            log.vvv(`${host.name}: deleted ${key}`)
            continue
          }
        }
      }
      //Set groups
      for (const {action, key: group} of groups) {
        switch (action) {
          case "set": {
            if (!host.groups.includes(group)) {
              host.groups.push(group)
              log.vvv(`${host.name}: added to group ${group}`)
            }
            continue
          }
          case "delete": {
            if (host.groups.includes(group)) {
              host.groups.splice(host.groups.indexOf(group), 1)
              log.vvv(`${host.name}: removed from group ${group}`)
            }
            continue
          }
        }
      }

      //Save host updates
      log.vvv(`${host.name}: saved updated`)
      await host.save()
    }
  },
  /** Delete hosts */
  async delete({inventory = "default", yes = false}, targets = []) {
    //Query hosts
    const hosts = await it.inventories[inventory].query(targets)
    if (!hosts.length) {
      console.log(italic(gray("(no hosts matched)")))
      return
    }

    //User confirmation
    if ((!yes) && (!await Confirm.prompt(`The following hosts will be deleted, confirm changes?\n${hosts.map(name => `  - ${name}`).join("\n")}\n`)))
      throw new ItsudenoError.Aborted("operation aborted by user")

    //Delete hosts
    for (const host of hosts)
      await it.inventories[inventory].delete(host)
  },
}
