//Imports
import {Suite, assert, assertStrictEquals} from "@testing"
import {ucfirst} from "core/tools/strings/ucfirst.ts"
import {lcfirst} from "core/tools/strings/lcfirst.ts"
import {strcase} from "core/tools/strings/strcase.ts"

//Tests
await new Suite(import.meta.url)
    .group("ucfirst", test => {
        test("case 1", () => assertStrictEquals(ucfirst("itsudeno"), "Itsudeno"))
        test("case 2", () => assertStrictEquals(ucfirst("Itsudeno"), "Itsudeno"))
        test("case 3", () => assertStrictEquals(ucfirst("ITsuDEno"), "ITsuDEno"))
    })
    .group("lcfirst", test => {
        test("case 1", () => assertStrictEquals(lcfirst("itsudeno"), "itsudeno"))
        test("case 2", () => assertStrictEquals(lcfirst("Itsudeno"), "itsudeno"))
        test("case 3", () => assertStrictEquals(lcfirst("ITsuDEno"), "iTsuDEno"))
    })
    .conclude()
