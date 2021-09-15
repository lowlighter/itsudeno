//Imports
import {access, clone, deepfreeze} from "@tools/objects"
import {assertEquals, assertThrows, Suite} from "@testing"
import type {test} from "@testing"

//Tests
await new Suite(import.meta.url, "objects")
  .group("access", test => {
    test("path", () => assertEquals(access({foo: {bar: true}}, "foo.bar"), true))
    test("unexisting path", () => assertThrows(() => access({foo: {bar: true}}, "foo.bar.baz")))
  })
  .test("clone", () => assertEquals(clone({foo: {bar: true}}), {foo: {bar: true}}))
  .test("deepfreeze", () => assertThrows(() => (deepfreeze({foo: {bar: true}}) as test).baz = true, TypeError, "object is not extensible"))
  .missing("deepdiff")
  .conclude()
