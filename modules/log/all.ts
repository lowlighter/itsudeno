//Imports
import {Module} from "@generated/modules/log/it.ts"
import type {before} from "@generated/modules/log/it.ts"

/** Generic implementation */
Module.register(
  import.meta.url,
  class extends Module {
    /** Check configuration changes */
    //deno-lint-ignore require-await
    async check(result: before) {
      return this.apply(result)
    }

    /** Apply configuration changes */
    //deno-lint-ignore require-await
    async apply({args: {message}}: before) {
      return {message}
    }
  },
)
