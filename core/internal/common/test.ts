//Imports
import {definition, InternalCommonTestsCore} from "@core/internal/common/tests/mod.ts"
import {Common} from "@core/internal/common"
import {assert, assertEquals, assertObjectMatch, assertStrictEquals, assertThrowsAsync, Suite} from "@testing"
import type {test} from "@testing"

//Tests
await new Suite(import.meta.url)
  .test("definition and metadata loader", async () => {
    assertObjectMatch(await Common.about(InternalCommonTestsCore.url), {
      section: "core",
      about: "test",
      path: "core/internal/common/tests",
      name: "core.internal.common.tests",
      classname: "InternalCommonTestsCore",
      implementations: ["mod.ts"],
      definition,
      paths: {},
    })
  })
  .test("async constructor", async () => {
    const instance = new InternalCommonTestsCore()
    assert(instance instanceof InternalCommonTestsCore)
    assertStrictEquals(instance.ready.state, "pending")
    await instance.ready
    assertStrictEquals(instance.ready.state, "fulfilled")
  })
  .test("definition", async () => {
    const instance = await new InternalCommonTestsCore().ready
    assertEquals(instance.definition, definition)
  })
  .test("validator (success)", async () => {
    const instance = await new InternalCommonTestsCore().ready
    assertEquals(await instance.prevalidate({foo: true}), {foo: true, bar: false})
  })
  .test("validator (fail)", async () => {
    const instance = await new InternalCommonTestsCore().ready
    await assertThrowsAsync(() => instance.prevalidate({baz: true}))
  })
  .test("implementations and autoload", async () => {
    const instance = await new InternalCommonTestsCore().ready
    InternalCommonTestsCore.register("mod.ts", InternalCommonTestsCore)
    assertStrictEquals((instance as test).autoload({os: "mod.ts"}), InternalCommonTestsCore)
  })
  .conclude()
