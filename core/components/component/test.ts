//Imports
import {Suite, assertStrictEquals, TestTracer} from "../../testing/mod.ts"
import type {test} from "../../testing/mod.ts"
import {Component} from "./mod.ts"

//Tests
await new Suite(import.meta.url)
    .group("component", async test => {
        const component = await new Component(import.meta.url, "test").ready
        test(".meta", () => assertStrictEquals((component as test).meta, import.meta.url))
        test(".module", () => assertStrictEquals(component.module, "core/components/component"))
        test(".id", () => assertStrictEquals(component.id, "test"))
        test(".ready", () => assertStrictEquals(component.ready.state, "fulfilled"))
        test(".toString()", () => assertStrictEquals(`${component}`, "[test Component]"))
        test(".definition", () => assertStrictEquals(typeof component.definition, "object"))
        test(".tracer", async () => {
            assertStrictEquals((component as test).tracer, null)
            const tracer = await new TestTracer().ready
            Object.assign(component, {context:{vars:{it:{tracer}}}})   
            assertStrictEquals((component as test).tracer, tracer)
        })
    })
    .conclude()
