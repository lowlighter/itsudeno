//Imports
import {Module} from "@generated/modules/control/noop/it.ts"

/** Generic implementation */
Module.register(
  import.meta.url,
  class extends Module {
    /** Check configuration changes */
    //deno-lint-ignore require-await
    async check() {
      return this.apply()
    }

    /** Apply configuration changes */
    //deno-lint-ignore require-await
    async apply() {
      return null
    }
  },
)
