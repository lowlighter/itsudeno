//Imports
import {Module} from "@generated/modules/net/test/it.ts"
import type {before} from "@generated/modules/net/test/it.ts"
import {run} from "@tools/run"

/** Generic implementation */
Module.register(
  import.meta.url,
  class extends Module {
    /** Check configuration changes */
    async check(result: before) {
      return await this.apply(result)
    }

    /** Apply configuration changes */
    async apply({args: {host, port}}: before) {
      const command = port ? `bash -c "echo > /dev/tcp/${host}/${port}"}` : `ping -c 1 ${host}`
      const {success} = await run(command)
      if (!success)
        throw new Error(`Connection failed`)
      return null
    }
  },
)
