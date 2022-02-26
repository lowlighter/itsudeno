// Imports
import { basename, fromFileUrl } from "https://deno.land/std@0.123.0/path/mod.ts"
import { assert, assertStrictEquals, Suite } from "../testing/mod.ts"
import { esm } from "./esm.ts"
import { root } from "./root.ts"

// Tests
await new Suite(import.meta.url).group("root.url", test => {
	test("is instanceof URL", () => assert(root.url instanceof URL))
	test("is itsudeno", () => assertStrictEquals(basename(root.url.pathname), "itsudeno"))
}).group("root.path", test => {
	test("is string", () => assert(typeof root.path === "string"))
	test("is itsudeno", () => assertStrictEquals(basename(root.path), "itsudeno"))
}).group("root.relative", test => {
	for (const [expected, options] of [["core/meta/test", {}], ["core/meta/test.ts", {ext: true}]] as const) {
		test(`(url, ${Deno.inspect(options)})`, () => assertStrictEquals(root.relative(new URL(import.meta.url), options), expected))
		test(`(urlstring ${Deno.inspect(options)})`, () => assertStrictEquals(root.relative(import.meta.url, options), expected))
		test(`(filepath, ${Deno.inspect(options)})`, () => assertStrictEquals(root.relative(fromFileUrl(import.meta.url), options), expected))
	}
}).group("esm", test => {
	test("path", () => assertStrictEquals(esm(import.meta.url), "core/meta/test"))
	test("dir", () => assertStrictEquals(esm(import.meta.url, {dir: true}), "core/meta"))
}).conclude()