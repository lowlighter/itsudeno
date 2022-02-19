// Imports
import { assertEquals, assertStrictEquals, Suite, test } from "../../testing/mod.ts"
import { is } from "./type.ts"

// Tests
const suite = new Suite(import.meta.url)
for (
	const [type, [ist, ...tests]] of Object.entries({
		unknown: [is.unknown, [undefined, true], [null, true], [false, true], ["", true], [0, true]],
		void: [is.void, [undefined, true], ["undefined", false, {like: true}], [null, false], [false, false], ["", false], [0, false]],
		null: [is.null, [undefined, false], [null, true], ["null", false, {like: true}], [false, false], ["", false], [0, false]],
		boolean: [
			is.boolean,
			[undefined, false],
			[null, false],
			[false, true],
			[true, true],
			["false", false, {like: true}],
			["true", false, {like: true}],
			["yes", false, {like: true}],
			["no", false, {like: true}],
			["", false],
			[0, false],
		],
		number: [
			is.number,
			[undefined, false],
			[null, false],
			[false, false],
			["", false],
			[0, true],
			["0", false, {like: true}],
			["1", false, {like: true}],
			["-1", false, {like: true}],
			["3.14", false, {like: true}],
			["+3.14", false, {like: true}],
			["-3.14", false, {like: true}],
			["NaN", false, {like: true}],
			["+Infinity", false, {like: true}],
			["-Infinity", false, {like: true}],
			["0b101010", false, {like: true}],
			["0o52", false, {like: true}],
			["0x2a", false, {like: true}],
		],
		"number.nan": [is.number.nan, [0, false], [1, false], [-1, false], [3.14, false], [-3.14, false], [NaN, true], [+Infinity, false], [-Infinity, false]],
		"number.finite": [is.number.finite, [0, true], [1, true], [-1, true], [3.14, true], [-3.14, true], [NaN, false], [+Infinity, false], [-Infinity, false]],
		"number.integer": [is.number.integer, [0, true], [1, true], [-1, true], [3.14, false], [-3.14, false], [NaN, false], [+Infinity, false], [-Infinity, false]],
		"number.float": [is.number.float, [0, true], [1, true], [-1, true], [3.14, true], [-3.14, true], [NaN, false], [+Infinity, false], [-Infinity, false]],
		"number.positive": [is.number.positive, [0, true], [1, true], [-1, false], [3.14, true], [-3.14, false], [NaN, false], [+Infinity, true], [-Infinity, false]],
		"number.negative": [is.number.negative, [0, true], [1, false], [-1, true], [3.14, false], [-3.14, true], [NaN, false], [+Infinity, false], [-Infinity, true]],
		"number.zero": [is.number.zero, [0, true], [1, false], [-1, false], [3.14, false], [-3.14, false], [NaN, false], [+Infinity, false], [-Infinity, false]],
		"number.percentage": [is.number.percentage, [0, true], [1, true], [-1, false], [3.14, false], [-3.14, false], [NaN, false], [+Infinity, false], [-Infinity, false]],
		string: [is.string, [undefined, false], [null, false], [false, false], ["", true]],
		"string.length": [
			is.string.length,
			[undefined, false],
			[null, false],
			[false, false],
			["", false],
			["foo", true],
			["", true, {args: [0]}],
			["foo", true, {args: [3]}],
			["foo", false, {args: [0]}],
			["", false, {args: [{min: 1}]}],
			["foo", true, {args: [{min: 1}]}],
			["", true, {args: [{max: 1}]}],
			["foo", false, {args: [{max: 1}]}],
			["", false, {args: [{min: 1, max: 2}]}],
			["f", true, {args: [{min: 1, max: 2}]}],
			["foo", false, {args: [{min: 1, max: 2}]}],
		],
	}) as test
) {
	suite.group(type, test => {
		for (const [value, expected, {strict = true, like = false, args = []} = {}] of tests) {
			const assert = strict ? assertStrictEquals : assertEquals
			test(`(${[Deno.inspect(value), ...args.map(Deno.inspect)].join(", ")}) ${expected ? "=" : "≠"}`, () => assert(ist(value, ...args), expected))
			if (like)
				test(`.like(${[Deno.inspect(value), ...args.map(Deno.inspect)].join(", ")}) ≈`, () => assert(ist.like(value, ...args), true))
		}
	})
}
await suite.conclude()
