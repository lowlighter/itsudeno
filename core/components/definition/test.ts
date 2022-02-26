// Imports
import ConsoleTracer from "../../../builtin/tracer/console/mod.ts"
import { assertObjectMatch, ItsudenoError, Suite } from "../../testing/mod.ts"
import type { test } from "../../testing/mod.ts"
import { Context } from "../context/mod.ts"
import { check } from "./definition.ts"

// Tests
await new Suite(import.meta.url).group("check", async test => {
	const context = await (await new Context(import.meta.url).ready).with({foo: "foo"})
	const tracer = await new ConsoleTracer().ready
	const error = (type: string, arg = Error as unknown, path = "error") =>
		new ItsudenoError.Type(`test: schema.${path} is expected to be ${type} but got ${Deno.inspect(arg)} instead`)

	/*@define({
    name:"test",
    description:"",
    inputs:{},
    outputs:null,
    for:[]
  })
  class A {

  }

  console.log((new A() as any).validate)*/

	// empty schema
	// deprecaed
	// aliases
	// required
	// object but not
	// conflicts
	// dependency

	test("", async () =>
		assertObjectMatch(
			await check({name: "test", inputs: {foo: {type: "string", conflicts: ["bar"]}, bar: {type: "string", aliases: ["baz"]}}} as test, {foo: "foo"}, {tracer, context}),
			{},
		))

	for (
		const [schema, actual, expected] of [
			// Null
			[
				{
					raw: {type: "null"},
					like: {type: "null"},
					templated: {type: "null"},
					defaults: {type: {raw: {type: "null", defaults: null}, like: {type: "null", defaults: "null"}, templated: {type: "null", defaults: "${null}"}}},
					error: {type: "null"},
				},
				{raw: null, like: "null", templated: "${null}", error: Error},
				{raw: null, like: null, templated: null, defaults: {raw: null, like: null, templated: null}, error: error("null")},
			],
			// Boolean
			[
				{
					raw: {type: {true: {type: "boolean"}, false: {type: "boolean"}}},
					like: {type: {true: {type: "boolean"}, false: {type: "boolean"}, yes: {type: "boolean"}, no: {type: "boolean"}}},
					templated: {type: {raw: {type: "boolean"}, like: {type: "boolean"}}},
					defaults: {type: {raw: {type: "boolean", defaults: true}, like: {type: "boolean", defaults: "yes"}, templated: {type: "boolean", defaults: "${true}"}}},
					error: {type: "boolean"},
				},
				{raw: {true: true, false: false}, like: {true: "true", false: "false", yes: "yes", no: "no"}, templated: {raw: "${true}", like: "${'yes'}"}, error: Error},
				{
					raw: {true: true, false: false},
					like: {true: true, false: false, yes: true, no: false},
					templated: {raw: true, like: true},
					defaults: {raw: true, like: true, templated: true},
					error: error("boolean"),
				},
			],
			// Number
			[{
				raw: {
					type: {
						integer: {type: {zero: {type: "number"}, positive: {type: "number"}, negative: {type: "number"}}},
						float: {type: {positive: {type: "number"}, negative: {type: "number"}}},
						infinity: {type: {positive: {type: "number"}, negative: {type: "number"}}},
						nan: {type: "number"},
					},
				},
				like: {
					type: {
						integer: {type: {zero: {type: "number"}, positive: {type: "number"}, negative: {type: "number"}}},
						float: {type: {positive: {type: "number"}, negative: {type: "number"}}},
						infinity: {type: {positive: {type: "number"}, negative: {type: "number"}}},
						nan: {type: "number"},
						format: {type: {binary: {type: "number"}, octal: {type: "number"}, decimal: {type: "number"}, hexadecimal: {type: "number"}, bigint: {type: "number"}}},
					},
				},
				templated: {type: {raw: {type: "number"}, like: {type: "number"}}},
				defaults: {type: {raw: {type: "number", defaults: 1}, like: {type: "number", defaults: "1"}, templated: {type: "number", defaults: "${1}"}}},
				error: {type: "number"},
			}, {
				raw: {integer: {zero: 0, positive: 1, negative: -1}, float: {positive: 0.5, negative: -0.5}, infinity: {positive: Infinity, negative: -Infinity}, nan: NaN},
				like: {
					integer: {zero: "0", positive: "1", negative: "-1"},
					float: {positive: "0.5", negative: "-0.5"},
					infinity: {positive: "Infinity", negative: "-Infinity"},
					nan: "NaN",
					format: {binary: "0b1010", octal: "0o12", decimal: "10", hexadecimal: "0xA", bigint: "10n"},
				},
				templated: {raw: "${1}", like: "${'1'}"},
				error: Error,
			}, {
				raw: {integer: {zero: 0, positive: 1, negative: -1}, float: {positive: 0.5, negative: -0.5}, infinity: {positive: Infinity, negative: -Infinity}, nan: NaN},
				like: {
					integer: {zero: 0, positive: 1, negative: -1},
					float: {positive: 0.5, negative: -0.5},
					infinity: {positive: Infinity, negative: -Infinity},
					nan: NaN,
					format: {binary: 10, octal: 10, decimal: 10, hexadecimal: 10, bigint: 10},
				},
				templated: {raw: 1, like: 1},
				defaults: {raw: 1, like: 1, templated: 1},
				error: error("number"),
			}],
			// String
			[
				{
					raw: {type: "string"},
					like: {type: "string"},
					templated: {type: "string"},
					defaults: {type: {raw: {type: "string", defaults: ""}, like: {type: "string", defaults: ""}, templated: {type: "string", defaults: "${''}"}}},
					error: {type: "string"},
				},
				{raw: "", like: "", templated: "${''}", error: Error},
				{raw: "", like: "", templated: "", defaults: {raw: "", like: "", templated: ""}, error: error("string")},
			],
			// RegExp
			[
				{
					raw: {type: "regexp"},
					like: {type: {pattern: {type: "regexp"}, regexp: {type: "regexp"}}},
					templated: {type: {pattern: {type: "regexp"}, regexp: {type: "regexp"}}},
					defaults: {
						type: {raw: {type: "regexp", defaults: /a+b*c?/}, like: {type: "regexp", defaults: "/a+b*c?/"}, templated: {type: "regexp", defaults: "${/a+b*c?/}"}},
					},
					error: {type: "regexp"},
				},
				{raw: /a+b*c?/, like: {pattern: "a+b*c?", regexp: "/a+b*c?/"}, templated: {pattern: "${'a+b*c?'}", regexp: "${/a+b*c?/}"}, error: Error},
				{
					raw: /a+b*c?/,
					like: {pattern: /a\+b\*c\?/, regexp: /a+b*c?/},
					templated: {pattern: /a\+b\*c\?/, regexp: /a+b*c?/},
					defaults: {raw: /a+b*c?/, like: /a+b*c?/, templated: /a+b*c?/},
					error: error("regexp"),
				},
			],
		] as const
	) {
		test(`(${schema.raw.type})`, async () =>
			assertObjectMatch(await check({name: "test", inputs: {schema: {type: schema}}} as test, {schema: actual}, {tracer, context}), {schema: expected}))
	}
}).conclude()

/*
unknown

object
function
url
date
bigint
*/
