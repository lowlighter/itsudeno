//Imports
import {Suite, assertStrictEquals, assert, assertThrows, ItsudenoError} from "@testing"
import {Tracer, TracerEvent} from "core/components/tracer/mod.ts"
import type {level} from "core/components/tracer/mod.ts"

//Tests
await new Suite(import.meta.url)
    .group("tracer", async test => {
        class TestTracer extends Tracer {
            handle(event:TracerEvent) {
                this.handled.add(event.data)
            }
            readonly handled = new Set<unknown>()
        }
        const tracer = await new TestTracer(import.meta.url, "test").ready
        test(".meta", () => assertStrictEquals(tracer.meta, import.meta.url))
        test(".module", () => assertStrictEquals(tracer.module, "core/components/tracer"))
        test(".id", () => assertStrictEquals(tracer.id, "test"))
        test(".ready", () => assertStrictEquals(tracer.ready.state, "fulfilled"))
        test(".toString()", () => assertStrictEquals(`${tracer}`, "[test TestTracer]"))
        test(".definition", () => assertStrictEquals(typeof tracer.definition, "object"))

        for (const level of Object.keys(TracerEvent.level) as level[])
            test(`.${level}()`, () => {
                switch (level) {
                    case "fatal":
                        assertThrows(() => tracer[level](level), ItsudenoError.Fatal)
                        break
                    default:
                        tracer[level](level)
                }
                assert(tracer.handled.has(level))
            })

    })
    .conclude()
