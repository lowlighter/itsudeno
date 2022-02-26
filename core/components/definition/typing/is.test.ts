// Imports
import { assertStrictEquals, Suite } from "../../../testing/mod.ts"
import {is} from "./mod.ts"

//Tests
const tests = {
  unknown:{
    use:is.unknown,
    yes:[null, {}, "", 0, false],
    no:[]
  },
  get ["unknown.like"]() {
    return {...this.unknown, use:is.unknown.like}
  },
  void:{
    use:is.void,
    yes:[undefined],
    no:["undefined", null, ""],
  },
  "void.like":{
    use:is.void.like,
    yes:[undefined, "undefined"],
    no:[null, ""],
  },
  boolean:{
    use:is.boolean,
    yes:[true, false],
    no:["true", "false", null, 0, 1],
  },
  "boolean.like":{
    use:is.boolean.like,
    yes:[true, "true", "yes", false, "false", "no"],
    no:[null, "", 0, 1]
  },
  "boolean.truthy":{
    use:is.boolean.truthy,
    yes:[true, "true", "yes"],
    no:[false, "false", "no", 1]
  },
  "boolean.falsy":{
    use:is.boolean.falsy,
    yes:[false, "false", "no"],
    no:[true, "true", "yes", 0]
  },
  number:{
    use:is.number,
    yes:[0, +1, -1, NaN, Infinity, -Infinity],
    no:["0", "+1", "-1", "0.5", "+0.5", "-0.5", ".5", "+.5", "-.5", "0b1010", "0o12", "0xa", "10n", "NaN", "Infinity", "-Infinity", "", true, false]
  },
  "number.like":{
    use:is.number.like,
    yes:[0, +1, -1, NaN, Infinity, -Infinity, "0", "+1", "-1", "0.5", "+0.5", "-0.5", ".5", "+.5", "-.5", "0b1010", "0o12", "0xa", "10n", "NaN", "Infinity", "-Infinity"],
    no:["", true, false, "1.1.1"]
  },
  "number.nan":{
    use:is.number.nan,
    yes:[NaN],
    no:["NaN", 0, Infinity, -Infinity]
  },
  "number.finite":{
    use:is.number.finite,
    yes:[0, 0.5],
    no:[NaN, Infinity, -Infinity, "0"]
  },
  "number.integer":{
    use:is.number.integer,
    yes:[0, 1],
    no:[NaN, Infinity, -Infinity, "0", 0.5]
  },
  get ["number.float"]() {
    return {...this["number.finite"], use:is.number.float}
  },
  "number.positive":{
    use:is.number.positive,
    yes:[0, 1, +Infinity],
    no:[NaN, -Infinity, -1, "1"]
  },
  "number.negative":{
    use:is.number.negative,
    yes:[0, -1, -Infinity],
    no:[NaN, Infinity, 1, "-1"]
  },
  "number.zero":{
    use:is.number.zero,
    yes:[0, +0, -0],
    no:[NaN, 1, "0"]
  },
  "number.percentage":{
    use:is.number.percentage,
    yes:[0, 0.5, 1],
    no:[NaN, 2, -1, "0.5"]
  },
  string:{
    use:is.string,
    yes:[""],
    no:[{}, 1, true]
  },
  "string.like":{
    use:is.string.like,
    yes:["", null, {}, undefined, 1, true],
    no:[]
  },
  object:{
    use:is.object,
    yes:[{}, null],
    no:[true, "", false, NaN]
  },
  "object.like":{
    use:is.object.like,
    yes:[{}, null, '{"foo": true}'],
    no:[true, "", NaN, '[]', '"hey"']
  },
  "object.empty":{
    use:is.object.empty,
    yes:[{}, null],
    no:[{foo:true}, true, "", NaN, []]
  },
  "object.parseable":{
    use:is.object.parseable,
    yes:[{toJSON() { return '{"foo": true}' }}, '{"foo": true}'],
    no:[{}, null, "", true]
  },
  "object.stringifiable":{
    use:is.object.stringifiable,
    yes:[{toJSON() { return '{"foo": true}' }}, {foo:true}, {}, null],
    no:[{toJSON() { throw new Error() }}, '{"foo": true}', true, false]
  },
  function:{
    use:is.function,
    yes:[Object, function () {}, function*() {}, async function () {}, async function*() {}, () => null, async () => null],
    no:[true, {}, null, "function () {}", "() => null"]
  },
  "function.like":{
    use:is.function.like,
    yes:[Object, function () {}, function*() {}, async function () {}, async function*() {}, () => null, async () => null, "function () {}", "function*() {}", "async function () {}", "async function*() {}", "() => null", "async () => null", "async () => { return null }"],
    no:[true, {}, null]
  },
  url:{
    use:is.url,
    yes:[new URL("https://itsudeno.land")],
    no:["https://itsudeno.land", "", {}]
  },
  "url.like":{
    use:is.url.like,
    yes:[new URL("https://itsudeno.land"), "https://itsudeno.land"],
    no:["", {}]
  },
  date:{
    use:is.date,
    yes:[new Date()],
    no:["1970-01-01T00:00:00.000Z", "1970-01-01", "", 0, false, null]
  },
  "date.like":{
    use:is.date.like,
    yes:[new Date(), 0, "1970-01-01T00:00:00.000Z", "1970-01-01"],
    no:["", false, null]
  },
  bigint:{
    use:is.bigint,
    yes:[0, 10, 0n, 10n, -10n],
    no:[1.5, -1.5, "10n", "-10n", "+10n", "10", "-10", "0", "0n", false, true]
  },
  "bigint.like":{
    use:is.bigint.like,
    yes:[0, 10, 0n, 10n, -10n, "10n", "-10n", "+10n", "10", "-10", "0", "0n", {valueOf() { return 1 }}],
    no:["1.5n", "1.5", false, true, {valueOf() { return "" }}]
  },
  regexp:{
    use:is.regexp,
    yes:[/foo/],
    no:["foo", {}, null]
  },
  "regexp.like":{
    use:is.regexp.like,
    yes:[/foo/, "foo", "/foo/"],
    no:["/++/", {}, null]
  },
} as const

// Tests
const suite = new Suite(import.meta.url)
for (const [name, {use, yes, no}] of Object.entries(tests)) {
  const tname = `is.${name}`
  suite.group(tname, test => {
    test("()", () => {
      for (const value of yes) 
        assertStrictEquals(use(value) ? tname : value , tname)
      for (const value of no) 
        assertStrictEquals(!use(value) ? `!${tname}` : value , `!${tname}`)
    })
  })
}
await suite.conclude()