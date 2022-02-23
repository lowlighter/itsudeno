// Imports
import { assert, assertThrows, assertStrictEquals, ItsudenoError, Suite, TestTracer } from "../../testing/mod.ts"
import {template} from "./template.ts"

// Tests
await new Suite(import.meta.url)
	.group("template", test => {

    test("('content')", () => {
      assertStrictEquals(template("foo", null, {sync:true}), "foo")
      assertStrictEquals(template("${foo}", null, {sync:true}), "${foo}")
    })

    test(`('<%= include("path") %>')`, async () => {
      assertStrictEquals(template("<%= include('core/tools/template/mod.ts') %>", null, {sync:true}), await Deno.readTextFile("core/tools/template/mod.ts"))
    })

    test("('content', null})", () => {
      assertStrictEquals(template("foo", null, {sync:true}), "foo")
      assertStrictEquals(template("${'foo'}", null, {sync:true}), "${'foo'}")
      assertStrictEquals(template("${foo}", null, {sync:true}), "${foo}")
      assertStrictEquals(template("<%= foo %>", {foo:"foo"}, {sync:true}), "foo")
    })

    test("('content', null, {inline: true})", () => {
      assertStrictEquals(template("foo", null, {sync:true, inline:true}), "foo")
      assertStrictEquals(template("${'foo'}", null, {sync:true, inline:true}), "foo")
      assertStrictEquals(template("${foo}", {foo:"foo"}, {sync:true, inline:true}), "foo")
      assertStrictEquals(template("foo ${'bar'}", null, {sync:true, inline:true}), "foo bar")
      assertStrictEquals(template("<%= foo %>", null, {sync:true, inline:true}), "<%= foo %>")
    })

    test("('content', null, {sync: true})", () => {
      assert(typeof template("foo", null, {sync:true}) === "string")
      assert(template("foo", null, {sync:false}) instanceof Promise)
    })

    test("('content', null, {tracer})", async () => {
      const tracer = await new TestTracer().ready
      template("<%= ${foo} %>", null, {tracer, sync:true, inline:true, safe:true})
      assert(tracer.handled.size > 0)
    })

    test("('<invalid>') throws ItsudenoError", () => {
      assertStrictEquals(template("<%= foo %>", null, {sync:true, safe:true}), "<%= foo %>")
    })

    test("('<invalid>') throws ItsudenoError", () => {
      assertThrows(() => template("<%= foo %>", null, {sync:true}), ItsudenoError.Template, "template error")
    })

	})
	.conclude()
