//Imports
import {before, Executor} from "@generated/executors/ssh/it.ts"
import {is} from "@tools/is"
import {run} from "@tools/run"

/** Generic implementation */
Executor.register(
  import.meta.url,
  class extends Executor {
    /** Apply executor */
    async apply(result: before, payload: string) {
      const {args: {host, login, password, port, key}} = result

      //Prepare ssh binary
      let ssh = ""
      if (password)
        ssh += `sshpass -p '${password}' `
      ssh += "ssh -o StrictHostKeyChecking=no "

      //Prepare ssh command
      ssh += `${host} -l ${login} -p ${port} -T `
      if (!is.null(key))
        ssh += `-i ${key}`

      //Prepare command
      const deno = `'deno run --allow-all --unstable --no-check -'`
      const command = `${ssh.trim()} ${deno}`

      return this.return(await run(command, {stdin: payload}))
    }
  },
)
