//Imports
import {Module} from "@generated/modules/net/ping/it.ts"
import type {before, result} from "@generated/modules/net/ping/it.ts"
import {run} from "@tools/run"
import {ItsudenoError} from "@errors"

/** Generic implementation */
Module.register(
  import.meta.url,
  class extends Module {
    /** Apply configuration changes */
    async apply({args: {host, packets}}: before) {
      //Ping target host
      const {success, stdout, stderr} = await run(`ping -n ${packets} ${host}`)
      const result = {host, ip: null, transmitted: NaN, received: NaN, loss: NaN} as result

      //Parse result
      if (success) {
        const {transmitted, received, loss} = stdout.match(/^\s*Packets: Sent = (?<transmitted>\d+), Received = (?<received>\d+), Lost = \d+ [(](?<loss>\d+)% loss[)]/m)?.groups ?? {}
        result.ip = stdout.match(/Ping statistics for (?<ip>[.\da-f:]+):/)?.groups?.ip ?? null
        result.transmitted = Number(transmitted)
        result.received = Number(received)
        result.loss = Number(loss) / 100
        if (result.loss === 1)
          throw new ItsudenoError.Module("all packets lost")
      }
      else {
        throw new ItsudenoError.Module(`failed to execute:\n${stderr}`)
      }
      return result
    }
  },
)
