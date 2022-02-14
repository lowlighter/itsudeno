//Imports
import {Suite, assertStrictEquals, assertObjectMatch} from "@testing"
import {Context} from "core/components/context/mod.ts"

//Tests
await new Suite(import.meta.url)
    .group("context", async test => {
        const context = await new Context(import.meta.url, "test").ready
        test(".meta", () => assertStrictEquals(context.meta, import.meta.url))
        test(".module", () => assertStrictEquals(context.module, "core/components/context"))
        test(".id", () => assertStrictEquals(context.id, "test"))
        test(".ready", () => assertStrictEquals(context.ready.state, "fulfilled"))
        test(".toString()", () => assertStrictEquals(`${context}`, "[test Context]"))
        test(".definition", () => assertStrictEquals(typeof context.definition, "object"))

        const a = await context.with({foo:true, bar:false})
        test("a.parent", () => assertStrictEquals(a.parent, context))
        test("a.vars", () => assertObjectMatch(a.vars, {foo:true, bar:false}))
        test("a.depth", () => assertStrictEquals(a.depth, 1))

        const b = await a.with({foo:false})
        test("b.parent", () => assertStrictEquals(b.parent, a))
        test("b.vars", () => assertObjectMatch(b.vars, {foo:false, bar:false}))
        test("b.depth", () => assertStrictEquals(b.depth, 2))
    })
    .conclude()
