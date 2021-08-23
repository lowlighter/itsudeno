//Imports
import {template} from "@tools/template"
import type {mode} from "@tools/template"
import {assertStrictEquals, assertThrowsAsync, ItsudenoError, Suite} from "@testing"

//Check templating mode support
async function supports({mode, sync}: {mode: mode, sync: boolean}) {
  try {
    await template("", {}, {mode, sync})
    return true
  }
  catch (error) {
    return !(error instanceof ItsudenoError.Unsupported)
  }
}

//Tests
const suite = new Suite(import.meta.url)
for (const sync of [true, false]) {
  suite.group(`template ${sync ? "sync" : "async"}`, async test => {
    {
      const mode = "js"
      if (await supports({mode, sync})) {
        test(`${mode}, static content`, async () => assertStrictEquals(await template("itsudeno", {}, {mode, sync}), "itsudeno"))
        test(`${mode}, dynamic content`, async () => assertStrictEquals(await template("${foo}", {foo: "itsudeno"}, {mode, sync}), "itsudeno"))
        test(`${mode}, dynamic content (unknown variable, safe)`, async () => assertStrictEquals(await template("${foo}", {}, {mode, sync, safe: true}), "${foo}"))
        test(`${mode}, dynamic content (unknown variable, error)`, () => assertThrowsAsync(() => template("${foo}", {}, {mode, sync}), ItsudenoError.Template, "foo is not defined"))
        test(`${mode}, scoped context`, () => assertThrowsAsync(() => template("${mode}", {}, {mode, sync}), ItsudenoError.Template, "mode is not defined"))
      }
    }
    {
      const mode = "ejs"
      if (await supports({mode, sync})) {
        test(`${mode}, static content`, async () => assertStrictEquals(await template("itsudeno", {}, {mode, sync}), "itsudeno"))
        test(`${mode}, dynamic content`, async () => assertStrictEquals(await template("<%= foo %>", {foo: "itsudeno"}, {mode, sync}), "itsudeno"))
        test(`${mode}, dynamic content (unknown variable, safe)`, async () => assertStrictEquals(await template("<%= foo %>", {}, {mode, sync, safe: true}), "<%= foo %>"))
        test(`${mode}, dynamic content (unknown variable, error)`, () => assertThrowsAsync(() => template("<%= foo %>", {}, {mode, sync}), ItsudenoError.Template, "foo is not defined"))
        test(`${mode}, scoped context`, () => assertThrowsAsync(() => template("<%= mode %>", {}, {mode, sync}), ItsudenoError.Template, "mode is not defined"))
      }
    }
  })
}
await suite.conclude()
