//Imports
import {run} from "@core/tasks"

/** Cli bindings */
export const cli = {
  /** Run file */
  async run(_: unknown, file: string) {
    await run({file: `${Deno.cwd()}/${file}`})
  },
}
