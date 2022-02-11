//Imports
import {Suite} from "core/tools/testing/suite.ts"
import {root} from "core/tools/meta/root.ts"
import {assert, assertStrictEquals} from "std/testing/asserts.ts"
import {basename, fromFileUrl} from "std/path/mod.ts"

//Tests
await new Suite(import.meta.url)
    .group("root.url", test => {
        test("instanceof URL", () => assert(root.url instanceof URL))
        test("root is itsudeno", () => assertStrictEquals(basename(root.url.pathname), "itsudeno"))
    })
    .group("root.path", test => {
        test("string", () => assert(typeof root.path === "string"))
        test("root is itsudeno", () => assertStrictEquals(basename(root.path), "itsudeno"))
    })
    .group("root.relative", test => {
        for (const [expected, options] of [["core/tools/meta/root_test", {}], ["core/tools/meta/root_test.ts", {ext:true}]] as const) {
            test(`url ${Deno.inspect(options)}`, () => assertStrictEquals(root.relative(new URL(import.meta.url), options), expected))
            test(`url-like string ${Deno.inspect(options)}`, () => assertStrictEquals(root.relative(import.meta.url, options), expected))
            console.log(fromFileUrl(import.meta.url))
            test(`filepath ${Deno.inspect(options)}`, () => assertStrictEquals(root.relative(fromFileUrl(import.meta.url), options), expected))
        }
    })
    .conclude()