//Imports
import {Suite, assert, assertThrows, ItsudenoError} from "../../testing/mod.ts"
import {throws} from "./throws.ts"
import {mandatory} from "./mandatory.ts"

//Tests
await new Suite(import.meta.url)
    .group("throws", test => {
        test("()", () => assertThrows(() => throws(new ItsudenoError("itsudeno!")), ItsudenoError, "itsudeno!"))
    })
    .group("mandatory", test => {
        test("()", () => assertThrows(() => mandatory(undefined), ItsudenoError.Reference, "missing mandatory value"))
        test("('foo')", () => assert(mandatory("foo")))
    })
    .conclude()
