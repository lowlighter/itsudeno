//Imports
import {Suite} from "core/tools/testing/suite.ts"
import {esm} from "core/tools/meta/esm.ts"
import {assert, assertStrictEquals} from "std/testing/asserts.ts"

//Tests
await new Suite(import.meta.url)
    .group("esm", test => {
        test("path", () => assertStrictEquals(esm(import.meta.url), "core/tools/meta/esm_test"))
        test("dir", () => assertStrictEquals(esm(import.meta.url, {dir:true}), "core/tools/meta"))
    })
    .conclude()
