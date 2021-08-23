//Imports
import {esm, exists, read, resolve, yaml} from "@tools/internal"
import {isAbsolute} from "std/path/mod.ts"
import {assert, assertEquals, assertStrictEquals, Suite} from "@testing"

//Tests
await new Suite(import.meta.url, "internal")
  .test("esm", () => assertStrictEquals(esm(import.meta.url), "core.tools"))
  .group("resolve", test => {
    test("relative file", () => assertStrictEquals(resolve("tests/test.yml", {base: "core/tools/", full: false, output: "file"}), "core/tools/tests/test.yml"))
    test("relative directory", () => assertStrictEquals(resolve("tests/test.yml", {base: "core/tools/", full: false, output: "directory"}), "core/tools/tests"))
    test("relative file, import.meta.url", () => assertStrictEquals(resolve("tests/test.yml", {base: import.meta.url, full: false, output: "file"}), "core/tools/tests/test.yml"))
    test("relative directory, import.meta.url", () => assertStrictEquals(resolve("tests/test.yml", {base: import.meta.url, full: false, output: "directory"}), "core/tools/tests"))
    test("absolute file", () => assert(isAbsolute(resolve("/tests/test.yml", {output: "file"}))))
    test("absolute directory", () => assert(isAbsolute(resolve("/tests/test.yml", {output: "directory"}))))
  })
  .group("read", test => {
    test("sync", () => assertStrictEquals(read("tests/test.yml", {base: import.meta.url, sync: true}), "foo: bar"))
    test("async", async () => assertStrictEquals(await read("tests/test.yml", {base: import.meta.url}), "foo: bar"))
  })
  .missing("write")
  .missing("remove")
  .missing("glob")
  .group("yaml", test => {
    test("sync", () => assertEquals(yaml("tests/test.yml", {base: import.meta.url, sync: true}), {foo: "bar"}))
    test("async", async () => assertEquals(await yaml("tests/test.yml", {base: import.meta.url}), {foo: "bar"}))
  })
  .group("exists", test => {
    test("sync", () => assert(exists("tests/test.yml", {base: import.meta.url, sync: true})))
    test("async", async () => assert(await exists("tests/test.yml", {base: import.meta.url})))
    test("sync (unexisting file)", () => assert(!exists("tests/unexisting.yml", {base: import.meta.url, sync: true})))
    test("async (unexisting file)", async () => assert(!await exists("tests/unexisting.yml", {base: import.meta.url})))
  })
  .conclude()
