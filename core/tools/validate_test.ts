//Imports
import {validate} from "@tools/validate"
import {assertEquals, assertThrowsAsync, ItsudenoError, Suite} from "@testing"
import type {test} from "@testing"

//Tests
const suite = new Suite(import.meta.url, "validate")
for (const mode of ["input", "output"] as test) {
  suite.group(mode, test => {
    test(`delayed strategy`, () => assertThrowsAsync(() => validate({foo: true}, null, {mode, strategy: "delayed"}), ItsudenoError.Validation, "validation errors"))
    test(`failfast strategy`, () => assertThrowsAsync(() => validate({foo: true}, null, {mode, strategy: "failfast"}), ItsudenoError.Validation, "no argument allowed"))

    test(`strict`, async () => assertEquals(await validate({foo: true}, {foo: {description: "foo", type: "boolean"}} as test, {mode, strict: true}), {foo: true}))
    test(`strict mode (error)`, () => assertThrowsAsync(() => validate({foo: true}, {foo: {type: "boolean"}} as test, {mode, strict: true, strategy: "failfast"}), ItsudenoError.Validation, "no description"))

    test(`arguments is empty`, async () => assertEquals(await validate({}, null, {mode}), null))
    test(`arguments is null`, async () => assertEquals(await validate(null, null, {mode}), null))
    test(`arguments is object`, () => assertThrowsAsync(() => validate("foo" as test, {}, {mode}), ItsudenoError.Validation, "expected arguments to be of type object"))

    test(`examples`, async () => assertEquals(await validate({foo: true}, {foo: {description: "foo", type: "boolean", examples: [true, false]}}, {mode, strict: true}), {foo: true}))

    test(`error, no arguments expected`, () => assertThrowsAsync(() => validate({foo: true}, null, {mode}), ItsudenoError.Validation, "no argument allowed"))
    test(`error, invalid argument`, () => assertThrowsAsync(() => validate({foo: true}, {}, {mode, strict: true}), ItsudenoError.Validation, "not a valid argument"))
    test(`error, missing description`, () => assertThrowsAsync(() => validate({foo: true}, {foo: {type: "boolean"}} as test, {mode, strict: true}), ItsudenoError.Validation, "no description"))
    test(`error, deprecated`, () => assertThrowsAsync(() => validate({foo: true}, {foo: {description: "foo", type: "boolean", deprecated: "test"}}, {mode, strict: true}), ItsudenoError.Validation, "is deprecated"))
    test(`error, invalid examples`, () => assertThrowsAsync(() => validate({foo: true}, {foo: {description: "foo", type: "boolean", examples: [true, "itsudeno"]}}, {mode, strict: true}), ItsudenoError.Validation, "invalid example"))
    test(`error, both required and default`, () => assertThrowsAsync(() => validate({}, {foo: {description: "foo", type: "string", required: true, default: "bar"}}, {mode, strict: true}), ItsudenoError.Validation, "cannot have a default value when it is also required"))

    for (
      const [args, defs] of [
        [{foo: "itsudeno"}, {foo: {type: "string"}}],
        [{foo: false}, {foo: {type: "boolean"}}],
        [{foo: -42}, {foo: {type: "number"}}],
      ] as test
    ) {
      test(`type check for ${defs.foo.type}`, async () => assertEquals(await validate(args, defs, {mode}), args))
      test(`type check for ${defs.foo.type} (implicit conversion)`, async () => assertEquals(await validate({foo: `${args.foo}`}, defs, {mode}), args))
    }
    if (mode === "input")
      test(`error, wrong type`, () => assertThrowsAsync(() => validate({foo: "bar"}, {foo: {type: "boolean"}} as test, {mode}), ItsudenoError.Validation, "must be of type"))

    test(`type check for nested type`, async () => assertEquals(await validate({foo: {bar: true}}, {foo: {type: {bar: {type: "boolean"}}}} as test, {mode}), {foo: {bar: true}}))
    if (mode === "input")
      test(`error, wrong type for nested type`, () => assertThrowsAsync(() => validate({foo: "bar"}, {foo: {type: {bar: {type: "boolean"}}}} as test, {mode}), ItsudenoError.Validation, "must match nested type definition"))

    test(`type check with additional constraints (and)`, async () => assertEquals(await validate({foo: 1}, {foo: {type: "number", match: [["integer", "positive"]]}} as test, {mode}), {foo: 1}))
    test(`type check with additional constraints (or)`, async () => assertEquals(await validate({foo: 1}, {foo: {type: "number", match: [["integer", "negative"], ["integer", "positive"]]}} as test, {mode}), {foo: 1}))
    if (mode === "input") {
      test(`error, not mactching additional constraints (and)`, () => assertThrowsAsync(() => validate({foo: NaN}, {foo: {type: "number", match: [["integer", "positive"]]}} as test, {mode}), ItsudenoError.Validation, "does not satisfy any additional type constraints"))
      test(`error, not mactching additional constraints (or)`, () => assertThrowsAsync(() => validate({foo: NaN}, {foo: {type: "number", match: [["integer", "negative"], ["integer", "positive"]]}} as test, {mode}), ItsudenoError.Validation, "does not satisfy any additional type constraints"))
    }

    test(`allowed values`, async () => assertEquals(await validate({foo: "bar"}, {foo: {type: "string", values: ["bar"]}} as test, {mode}), {foo: "bar"}))
    if (mode === "input")
      test(`error, wrong type`, () => assertThrowsAsync(() => validate({foo: "baz"}, {foo: {type: "string", values: ["bar"]}} as test, {mode}), ItsudenoError.Validation, "must be one of"))

    if (mode === "input") {
      test(`required argument`, async () => assertEquals(await validate({foo: "bar"}, {foo: {type: "string", required: true}} as test, {mode}), {foo: "bar"}))
      test(`error, required argument`, () => assertThrowsAsync(() => validate({}, {foo: {type: "string", required: true}} as test, {mode}), ItsudenoError.Validation, "is required"))

      test(`optional argument`, async () => assertEquals(await validate({}, {foo: {type: "string"}} as test, {mode}), {foo: null}))
      test(`optional argument with default`, async () => assertEquals(await validate({}, {foo: {type: "string", default: "bar"}} as test, {mode}), {foo: "bar"}))
      test(`optional argument with templated default`, async () => assertEquals(await validate({foo: "bar"}, {foo: {type: "string"}, bar: {type: "string", default: "${foo}"}} as test, {mode}), {foo: "bar", bar: "bar"}))
      test(`optional argument with nested templated default`, async () => assertEquals(await validate({foo: {bar: "bar"}}, {foo: {type: {bar: {type: "string"}}}, bar: {type: "string", default: "${foo.bar}"}} as test, {mode}), {foo: {bar: "bar"}, bar: "bar"}))
      test(`optional argument with templated default not overidden by context`, async () => assertEquals(await validate({foo: "bar"}, {foo: {type: "string"}, bar: {type: "string", default: "${foo}"}} as test, {mode, context: {foo: "baz"}}), {foo: "bar", bar: "bar"}))
      test(`error, optional argument with templated default`, () => assertThrowsAsync(() => validate({foo: "bar"}, {foo: {type: "string"}, bar: {type: "string", default: "${baz}"}} as test, {mode, strict: true}), ItsudenoError.Validation, "default value could not be templated correctly"))

      test(`aliases`, async () => assertEquals(await validate({f: "bar"}, {foo: {type: "string", aliases: ["f"]}} as test, {mode}), {foo: "bar"}))
      test(`error, redefining aliases`, () => assertThrowsAsync(() => validate({foo: "bar", f: "bar"}, {foo: {type: "string", aliases: ["f"]}} as test, {mode}), ItsudenoError.Validation, "defined multiple times"))

      test(`conflicting arguments`, async () => assertEquals(await validate({foo: "bar"}, {foo: {type: "string"}, bar: {type: "string", conflicts: ["foo"]}} as test, {mode}), {foo: "bar", bar: null}))
      test(`error, conflicting arguments`, () => assertThrowsAsync(() => validate({foo: "bar", bar: "bar"}, {foo: {type: "string"}, bar: {type: "string", conflicts: ["foo"]}} as test, {mode}), ItsudenoError.Validation, "cannot be used with"))
      test(`error, conflicting arguments with aliases`, () => assertThrowsAsync(() => validate({f: "bar", bar: "bar"}, {foo: {type: "string", aliases: ["f"]}, bar: {type: "string", conflicts: ["foo"]}} as test, {mode}), ItsudenoError.Validation, "cannot be used with"))

      test(`requiring arguments`, async () => assertEquals(await validate({foo: "bar", bar: "bar"}, {foo: {type: "string"}, bar: {type: "string", requires: ["foo"]}} as test, {mode}), {foo: "bar", bar: "bar"}))
      test(`requiring arguments with aliases`, async () => assertEquals(await validate({f: "bar", bar: "bar"}, {foo: {type: "string", aliases: ["f"]}, bar: {type: "string", requires: ["foo"]}} as test, {mode}), {foo: "bar", bar: "bar"}))
      test(`error, requiring arguments`, () => assertThrowsAsync(() => validate({bar: "bar"}, {foo: {type: "string"}, bar: {type: "string", requires: ["foo"]}} as test, {mode}), ItsudenoError.Validation, "is required with"))
    }

    if (mode === "output") {
      test(`optional result`, async () => assertEquals(await validate({}, {foo: {description: "foo", type: "string", optional: true}} as test, {mode, strict: true}), {foo: null}))
      test(`error, optional result not marked as optional`, () => assertThrowsAsync(() => validate({}, {foo: {description: "foo", type: "string"}} as test, {mode, strict: true}), ItsudenoError.Validation, "is empty"))
    }
  })
}
await suite.conclude()
