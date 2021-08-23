//Imports
import {Executor} from "@core/executors"
import {Module} from "@core/modules"
import {esm} from "@tools/internal"
import {is} from "@tools/is"
import {Reporters} from "@reporters"
import {assert, Suite} from "@testing"
import type {test} from "@testing"

//Tests
const suite = new Suite(import.meta.url)
for (const [type, Reporter] of Object.entries(Reporters) as test) {
  //Open a new inventory instance and populate it
  const setup = async function() {
    return await Reporter.open()
  }

  //Test each inventory
  suite.group(type, test => {
    test("reporter definition", async () => {
      const reporter = await setup()
      const {description, args} = reporter.definition
      assert(is.string(description), `missing description in ${type}/mod.yml`)
      assert(is.object(args) || is.null(args), `missing args in ${type}/mod.yml`)
    })

    test("report outcome", async () => {
      const reporter = await setup()
      const outcome = (Executor as test).outcome({module: {name: "itsudeno", args: {}, target: "localhost"}, meta: {executor: esm(import.meta.url), scope: "test", target: "localhost"}, args: {}})
      outcome.result.module = (Module as test).outcome({name: "itsudeno", meta: {module: esm(import.meta.url), target: "localhost", mode: "apply"}, args: {}})
      reporter.report(outcome)
    })
  })
}
await suite.conclude()
