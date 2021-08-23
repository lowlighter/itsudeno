//Exposed modules and types
import {cli} from "./cli.ts"
export * from "./cli.ts"

//Entry point
if (import.meta.main)
  await cli(Deno.args)
