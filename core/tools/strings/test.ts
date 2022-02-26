// Imports
import { assertStrictEquals, Suite } from "../../testing/mod.ts"
import { lcfirst, ucfirst, strcase } from "./mod.ts"

// Tests
await new Suite(import.meta.url).group("ucfirst", test => {
	test("case 1", () => assertStrictEquals(ucfirst("itsudeno"), "Itsudeno"))
	test("case 2", () => assertStrictEquals(ucfirst("Itsudeno"), "Itsudeno"))
	test("case 3", () => assertStrictEquals(ucfirst("ITsuDEno"), "ITsuDEno"))
}).group("lcfirst", test => {
	test("case 1", () => assertStrictEquals(lcfirst("itsudeno"), "itsudeno"))
	test("case 2", () => assertStrictEquals(lcfirst("Itsudeno"), "itsudeno"))
	test("case 3", () => assertStrictEquals(lcfirst("ITsuDEno"), "iTsuDEno"))
}).conclude()
