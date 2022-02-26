// Imports
import { assertStrictEquals, assertThrows, Suite } from "../../testing/mod.ts"
import type { test } from "../../testing/mod.ts"
import { lcfirst, lower, strcase, ucfirst, upper } from "./mod.ts"

// Tests
await new Suite(import.meta.url).group("ucfirst", test => {
	test("()", () => {
		assertStrictEquals(ucfirst("itsudeno"), "Itsudeno")
		assertStrictEquals(ucfirst("Itsudeno"), "Itsudeno")
		assertStrictEquals(ucfirst("ITsuDEno"), "ITsuDEno")
	})
}).group("lcfirst", test => {
	test("()", () => {
		assertStrictEquals(lcfirst("itsudeno"), "itsudeno")
		assertStrictEquals(lcfirst("Itsudeno"), "itsudeno")
		assertStrictEquals(lcfirst("ITsuDEno"), "iTsuDEno")
	})
}).group("upper", test => {
	test("()", () => {
		assertStrictEquals(upper("itsudeno"), "ITSUDENO")
		assertStrictEquals(upper("Itsudeno"), "ITSUDENO")
		assertStrictEquals(upper("ITsuDEno"), "ITSUDENO")
	})
}).group("lower", test => {
	test("()", () => {
		assertStrictEquals(lower("itsudeno"), "itsudeno")
		assertStrictEquals(lower("Itsudeno"), "itsudeno")
		assertStrictEquals(lower("ITsuDEno"), "itsudeno")
	})
}).group("strcase", test => {
	const string = {
		snake: "foo_bar",
		kebab: "foo-bar",
		dot: "foo.bar",
		slash: "foo/bar",
		http: "Foo-Bar",
		train: "FOO-BAR",
		pascal: "FooBar",
		camel: "fooBar",
		flat: "foobar",
		macro: "FOOBAR",
	}
	const fcase = ["snake", "kebab", "dot", "slash", "http", "train", "pascal", "camel"]
	const tcase = [...fcase, "flat", "macro"]

	for (const from of fcase) {
		for (const to of tcase) {
			const actual = string[from as keyof typeof string]
			const expected = string[to as keyof typeof string]
			test(`("${actual}", {from: "${from}", to: "${to}"})`, () => assertStrictEquals(strcase(actual, {from, to} as test), expected))
		}
	}

	test("() throws ItsudenoError.Unsupported", () => {
		assertThrows(() => strcase("foobar", {from: "unknown", to: "dot"} as test))
		assertThrows(() => strcase("foobar", {from: "dot", to: "unknown"} as test))
	})
}).conclude()
