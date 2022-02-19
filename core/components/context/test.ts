// Imports
import { assertObjectMatch, assertStrictEquals, Suite } from "../../testing/mod.ts"
import type { test } from "../../testing/mod.ts"
import { Context } from "./mod.ts"

// Tests
await new Suite(import.meta.url).group("context", async test => {
	const context = await new Context(import.meta.url, "test").ready
	test(".meta", () => assertStrictEquals((context as test).meta, import.meta.url))
	test(".module", () => assertStrictEquals(context.module, "core/components/context"))
	test(".id", () => assertStrictEquals(context.id, "test"))
	test(".ready", () => assertStrictEquals(context.ready.state, "fulfilled"))
	test(".toString()", () => assertStrictEquals(`${context}`, "[test Context]"))
	test(".definition", () => assertStrictEquals(typeof context.definition, "object"))

	const a = await context.with({foo: true, bar: false})
	test("a.parent", () => assertStrictEquals((a as test).parent, context))
	test("a.vars", () => assertObjectMatch(a.vars, {foo: true, bar: false}))
	test("a.depth", () => assertStrictEquals((a as test).depth, 1))

	const b = await a.with({foo: false})
	test("b.parent", () => assertStrictEquals((b as test).parent, a))
	test("b.vars", () => assertObjectMatch(b.vars, {foo: false, bar: false}))
	test("b.depth", () => assertStrictEquals((b as test).depth, 2))
}).conclude()
