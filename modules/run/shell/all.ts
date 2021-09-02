//Imports
import {Module} from "@generated/modules/run/shell/it.ts"
import type {before, result} from "@generated/modules/run/shell/it.ts"
import {run} from "@tools/run"
import type {loose} from "@types"
import {ItsudenoError} from "@errors"

/** Generic implementation */
Module.register(
  import.meta.url,
  class extends Module {
    /** Apply configuration changes */
    async apply({args: {executable, command, cwd, environment:env}}: before) {
      const options = Object.assign({}, cwd ? {cwd} : {}, env ? {env}: {})
      const {code, success, stdout, stderr} = await run(`${executable.path} ${executable.options}`.trim(), {stdin:command, ...options})
      return {code, success, stdout, stderr}
    }
  },
)
