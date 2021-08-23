//Imports
import {stringify} from "std/encoding/yaml.ts"
import {settings} from "@settings"

/** Cli bindings */
export const cli = {
  /** Show settings */
  //deno-lint-ignore require-await
  async show() {
    return stringify(settings)
  },
}
