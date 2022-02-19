// Imports
import { stripColor } from "https://deno.land/std@0.123.0/fmt/colors.ts"
import { assert, assertMatch, assertStrictEquals, assertThrows, ItsudenoError, Suite, TestTracer } from "../../testing/mod.ts"
import type { test } from "../../testing/mod.ts"
import { TracerEvent } from "./mod.ts"
import type { level } from "./mod.ts"

// Tests
await new Suite(import.meta.url).group("tracer", async test => {
	const tracer = await new TestTracer(import.meta.url, "test").ready
	test(".meta", () => assertStrictEquals((tracer as test).meta, import.meta.url))
	test(".module", () => assertStrictEquals(tracer.module, "core/components/tracer"))
	test(".id", () => assertStrictEquals(tracer.id, "test"))
	test(".ready", () => assertStrictEquals(tracer.ready.state, "fulfilled"))
	test(".toString()", () => assertStrictEquals(`${tracer}`, "[test TestTracer]"))
	test(".definition", () => assertStrictEquals(typeof tracer.definition, "object"))

	for (const level of Object.keys(TracerEvent.level) as level[]) {
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
	}
}).group("tracer.event", async test => {
	const tracer = await new TestTracer(import.meta.url, "test").ready
	test(".toString()", () =>
		assertMatch(
			stripColor(new TracerEvent({tracer, level: "debug", data: "itsudeno"}).toString()),
			/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] \[debug\] \[test\] "itsudeno"$/,
		))
}).conclude()
