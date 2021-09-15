//Imports
import {throws} from "@tools/flow"
import {yaml} from "@tools/internal"
import {strcase} from "@tools/strings"
import {Modules} from "@modules"
import {assertObjectMatch, ItsudenoError, Suite} from "@testing"
import type {loose, test} from "@testing"

//Tests
const suite = new Suite(import.meta.url)
for (const [type, Module] of Object.entries(Modules) as test) {
  suite.group(type, async test => {
    try {
      const tests = await yaml<loose[]>(`/modules/${strcase(type, {from: "dot", to: "slash"})}/test.yml`, {base: import.meta.url})
      for (const {_, args, context, ...outcome} of tests)
        test(_ as string, async () => assertObjectMatch(await Module.call(args, context), outcome as loose))
    }
    catch (error) {
      if (error instanceof Deno.errors.NotFound)
        test("tests are defined", () => throws(new ItsudenoError(`no tests defined (please create a test.yml)`)))
    }
  })
}
await suite.conclude()
