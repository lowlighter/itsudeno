//Imports
import {resolve, yaml} from "@tools/internal"
import {is} from "@tools/is"
import {Logger} from "@tools/log"
import {deepmerge} from "@tools/std"
import type {infered} from "@types"
const log = new Logger(import.meta.url)

//Load settings file
const path = resolve(".itsudeno/settings.yml")
log.info(`loading settings from ${path}`)
const custom = {}
try {
  const parsed = await yaml<infered>(path).catch(() => ({}))
  if (is.object(parsed))
    Object.assign(custom, parsed)
}
catch {
  log.warn(`failed to load setting from ${path}`)
}

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
}, custom) as infered
export {settings}
