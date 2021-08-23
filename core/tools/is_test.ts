//Imports
import {is} from "@tools/is"
import {access} from "@tools/objects"
import {assertEquals, assertStrictEquals, Suite} from "@testing"
import type {test} from "@testing"

//Tests
const suite = new Suite(import.meta.url, "is")
for (
  const [type, tests] of Object.entries({
    void: [
      [undefined, true],
      ["undefined", false],
      [null, false],
      [false, false],
      ["foo", false],
      [0, false],
    ],
    "void.like": [
      [undefined, true],
      ["undefined", true],
      [null, false],
      [false, false],
      ["foo", false],
      [0, false],
    ],
  }) as test
) {
  suite.group(type, test => {
    for (const [value, expected, {strict = true, args = []} = {}] of tests)
      test(`${expected ? "=" : "≠"} ${JSON.stringify(value)}`, () => [assertEquals, assertStrictEquals][+strict]((access<test>(is, type))(value, ...args), expected))
  })
}
await suite.conclude()
