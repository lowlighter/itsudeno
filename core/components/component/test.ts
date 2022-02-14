//Imports
import {Suite, assertStrictEquals} from "@testing"
import {Component} from "core/components/component/mod.ts"

//Tests
await new Suite(import.meta.url)
    .group("component", async test => {
        const component = await new Component(import.meta.url, "test").ready
        test(".meta", () => assertStrictEquals(component.meta, import.meta.url))
        test(".module", () => assertStrictEquals(component.module, "core/components/component"))
        test(".id", () => assertStrictEquals(component.id, "test"))
        test(".ready", () => assertStrictEquals(component.ready.state, "fulfilled"))
        test(".toString()", () => assertStrictEquals(`${component}`, "[test Component]"))
        test(".definition", () => assertStrictEquals(typeof component.definition, "object"))
    })
    .conclude()
