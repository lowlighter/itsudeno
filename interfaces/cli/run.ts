//Imports
import {run} from "@core/tasks"
import {is} from "@tools/is"

/** Cli bindings */
export const cli = {
  /** Run file */
  async run({inventory = "default", vault = "default", reporter = "default", targets = "(all)"}, file: string) {
    await run({file: is.url(file) ? file : `${Deno.cwd()}/${file}`, meta: {using: "default", inventory, vault, report: reporter, targets}})
  },
}
