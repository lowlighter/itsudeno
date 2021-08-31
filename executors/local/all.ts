//Imports
import {before, Executor} from "@generated/executors/local/it.ts"
import {run} from "@tools/run"
import {ItsudenoError} from "@errors"

/** Generic implementation */
Executor.register(
  import.meta.url,
  class extends Executor {
    /** Apply executor */
    async apply(result: before, payload: string) {
      const {args: {shell}} = result
      switch (shell.type) {
        //Posix shell
        case "posix": {
          const deno = `deno run --allow-all --unstable --no-check -`
          const command = `${shell.executable} -c '${deno}'`
          return this.return(await run(command, {stdin: payload}))
        }
        //Powershell
        case "powershell": {
          const deno = `Start-Process -FilePath "deno" -Wait -NoNewWindow -ArgumentList "run", "--allow-all", "--unstable", "--no-check", "-"`
          const command = `${shell.executable} -Nologo -NoProfile -NonInteractive -ExecutionPolicy Unrestricted -Command '${deno}'`
          return this.return(await run(command, {stdin: payload}))
        }
        //Unsupported shell type
        default:
          throw new ItsudenoError.Unsupported(`unsupported shell type: ${shell.type}`)
      }
    }
  },
)
