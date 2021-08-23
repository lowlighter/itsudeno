//Imports
import {lcfirst, strcase, ucfirst} from "@tools/strings"
import {assertStrictEquals, assertThrows, ItsudenoError, Suite} from "@testing"

//Tests
await new Suite(import.meta.url, "strings")
  .test("ucfirst", () => assertStrictEquals(ucfirst("itsudeno"), "Itsudeno"))
  .test("lcfirst", () => assertStrictEquals(lcfirst("Itsudeno"), "itsudeno"))
  .group("strcase", test => {
    const tests = {
      snake: "it_su",
      camel: "itSu",
      dot: "it.su",
      kebab: "it-su",
      slash: "it/su",
      pascal: "ItSu",
      flat: "itsu",
    }
    for (const from of Object.keys(tests) as Array<keyof typeof tests>) {
      for (const to of Object.keys(tests) as Array<keyof typeof tests>) {
        if (["flat"].includes(from))
          test(`${from} → ${to}, error`, () => assertThrows(() => strcase(tests[from], {from, to}), ItsudenoError.Unsupported, "unsupported string case conversion"))
        else
          test(`${from} → ${to}`, () => assertStrictEquals(strcase(tests[from], {from, to}), tests[to]))
      }
    }
  })
  .conclude()
