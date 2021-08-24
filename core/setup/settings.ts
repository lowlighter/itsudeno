//Imports
import {resolve, yaml} from "@tools/internal"
import {Logger} from "@tools/log"
import {deepmerge} from "@tools/std"
import type {infered} from "@types"
const log = new Logger(import.meta.url)

//Load settings file
const path = resolve(".itsudeno/settings.yml")
log.info(`loading settings from ${path}`)

/** Settings */
const settings = deepmerge({
  path,
  executors: {
    ssh: {
      type: "ssh",
      port: 22,
    },
    local: {
      type: "local",
    },
  },
  inventories: {
    local: {
      type: "local",
      path: ".itsudeno/local.inventory",
    },
  },
  vaults: {
    local: {
      type: "local",
      path: ".itsudeno/local.vault",
      key: "hello itsudeno !",
    },
  },
  reporters: {
    console: {
      type: "console",
    },
  },
  env: {
    mode: "apply",
  },
}, await yaml<infered>(path).catch(() => ({})) ?? {})
export {settings}
