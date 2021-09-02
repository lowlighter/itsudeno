//Imports
import {run} from "@core/tasks"
import {is} from "@tools/is"

/** Cli bindings */
export const cli = {
  /** Run file */
  async run(_: unknown, file: string) {
    await run({file: is.url(file) ? file : `${Deno.cwd()}/${file}`})
  },
}
