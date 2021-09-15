//Imports
import {cli} from "@interfaces/cli"
import {Suite} from "@testing"

//Tests
await new Suite(import.meta.url)
  .test("settings", async () => void await cli(["settings", "show"]))
  .conclude()
