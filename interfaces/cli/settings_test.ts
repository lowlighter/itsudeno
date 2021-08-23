//Imports
import {cli} from "@interfaces/cli"
import {assertStrictEquals, Suite} from "@testing"

//Tests
await new Suite(import.meta.url)
  .test("settings", async () => assertStrictEquals(typeof await cli(["settings", "show"]), "string"))
  .conclude()
