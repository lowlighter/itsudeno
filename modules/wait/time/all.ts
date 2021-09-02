//Imports
import {Module} from "@generated/modules/wait/time/it.ts"
import type {before} from "@generated/modules/wait/time/it.ts"
import {Logger} from "@tools/log"
import {delay} from "std/async/delay.ts"
const log = new Logger(import.meta.url)

/** Generic implementation */
Module.register(
  import.meta.url,
  class extends Module {
    /** Check configuration changes */
    async check(result: before) {
      return await this.apply(result)
    }

    /** Apply configuration changes */
    async apply({args: {days, hours, minutes, seconds, milliseconds}}: before) {
      const time = (days * 24 + (hours * 60 + (minutes * 60 + seconds))) * 1000 + milliseconds
      log.info(`waiting ${time} milliseconds before continuing`)
      await delay(time)
      return null
    }
  },
)
