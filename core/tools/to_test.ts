//Imports
import {to} from "@tools/to"
import {assertEquals, assertStrictEquals, assertThrows, ItsudenoError, Suite} from "@testing"
import type {test} from "@testing"

//Tests
const suite = new Suite(import.meta.url, "to")
for (
  const [type, tests] of Object.entries({
    boolean: [
      [true, true],
      ["true", true],
      ["yes", true],
      [false, false],
      ["false", false],
      ["no", false],
      ["foo", Error],
      [42, Error],
      [null, Error],
      [undefined, Error],
      [[], Error],
      [{}, Error],
    ],
    string: [
      ["foo", "foo"],
      [42, "42"],
      [true, "true"],
      [null, ""],
      [undefined, ""],
      [[], "[]"],
      [{}, "{}"],
    ],
    number: [
      [42, 42],
      ["42", 42],
      ["-42", -42],
      ["+Infinity", Infinity],
      ["NaN", NaN, {strict: false}],
      [true, Error],
      ["foo", Error],
      [null, Error],
      [undefined, Error],
      [[], Error],
      [{}, Error],
    ],
    date: [
      [new Date(42e3), new Date(42e3), {strict: false}],
      [42e3, new Date(42e3), {strict: false}],
      [new Date(42e3).toISOString(), new Date(42e3), {strict: false}],
      [new Date(42e3).toUTCString(), new Date(42e3), {strict: false}],
      [new Date(42e3).toString(), new Date(42e3), {strict: false}],
      [true, Error],
      ["foo", Error],
      [null, Error],
      [undefined, Error],
      [[], Error],
      [{}, Error],
    ],
  }) as test
) {
  suite.group(type, test => {
    for (const [value, expected, {strict = true} = {}] of tests) {
      test(`${JSON.stringify(value)} → ${JSON.stringify(expected)}`, () => {
        if (expected === Error)
          assertThrows(() => (to as test)[type](value), ItsudenoError.Unsupported, "unsupported type conversion")
        else
          [assertEquals, assertStrictEquals][+strict]((to as test)[type](value), expected)
      })
    }
  })
}
await suite.conclude()
