//Imports
import {throws} from "@tools/flow"
import {assertThrows, Suite} from "@testing"

//Tests
await new Suite(import.meta.url, "flow")
  .test("throws", () => assertThrows(() => throws(new Error())))
  .conclude()
