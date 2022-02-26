// Imports
import { ItsudenoError, throws } from "../../../meta/errors.ts"
import { escape } from "../../../tools/regexp/mod.ts"
import { is } from "./is.ts"

/** Typing conversions */
export const to = {
	/** Null conversions */
	null(x: unknown): null {
		return is.null.like(x) ? null : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to null`))
	},

	/** Boolean conversions */
	boolean(x: unknown): boolean {
		return is.boolean.like(x)
			? is.boolean.truthy(x) ? true : is.boolean.falsy(x) ? false : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to boolean`))
			: throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to boolean`))
	},

	/** Number conversions */
	number(x: unknown): number {
		if ((is.string(x)) && (is.bigint.like(x)))
			x = x.replace(/n$/, "")
		return is.number.like(x) ? Number(x) : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to number`))
	},

	/** String conversions */
	string(x: unknown): string {
		return is.object.stringifiable(x) ? JSON.stringify(x) : `${x}`
	},

	/** Object conversions */
	object(x: unknown): Record<PropertyKey, unknown> {
		return is.object.like(x)
			? is.object.parseable(x) ? JSON.parse((is.object(x) && "toJSON" in x) ? x.toJSON() : `${x}`) : x
			: throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to object`))
	},

	/** Function conversions */
	// deno-lint-ignore ban-types
	function(x: unknown): Function {
		if (is.function(x))
			return x
		if (!is.string(x))
			throw new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to function`)
		try {
			const f = x as string
			for (
				const regex of [
					// Functions
					/^\s*(?<async>async\s+)?\s*function\s*(?<generator>\*)?\s*(?<name>[\s\S]+)?\s*\((?<params>[\s\S]+)?\)\s*\{(?<content>[\s\S]+)?\}$/,
					// Arrow functions
					/^\s*(?<async>async\s+)?\s*\((?<params>[\s\S]+)?\)\s*=>\s*\{(?<content>[\s\S]+)?\}$/,
					/^\s*(?<async>async\s+)?\s*(?<params>[\s\S]+)\s*=>\s*\{(?<content>[\s\S]+)?\}$/,
					/^\s*(?<async>async\s+)?\s*\((?<params>[\s\S]+)?\)\s*=>\s*(?<content>[\s\S]+)$/,
					/^\s*(?<async>async\s+)?\s*(?<params>[\s\S]+)\s*=>\s*(?<content>[\s\S]+)$/,
				] as const
			) {
				if (regex.test(f)) {
					const {async: __async, generator: __generator, params: _params = "", body: _body} = f.match(regex)!.groups!
					const _async = (__async?.length > 0) ?? false
					const _generator = (__generator?.length > 0) ?? false
					const params = _params?.split(",").map(param => param.trim()).filter(param => param) ?? []
					const body = _body?.trim() ?? ""
					let constructor = Function
					switch (true) {
						case (_async && _generator):
							constructor = Object.getPrototypeOf(async function*() {}).constructor
							break
						case _async:
							constructor = Object.getPrototypeOf(async function() {}).constructor
							break
						case _generator:
							constructor = Object.getPrototypeOf(function*() {}).constructor
							break
					}
					return new constructor(...params, body.trim())
				}
			}
			throw new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to function`)
		} catch (error) {
			console.log(error)
			throw new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to function`)
		}
	},

	/** URL conversions */
	url(x: unknown): URL {
		return is.url.like(x) ? new URL(`${x}`) : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to url`))
	},

	/** Date conversions */
	date(x: unknown): Date {
		return is.date.like(x) ? new Date(x) : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to date`))
	},

	/** BigInt conversions */
	bigint(x: unknown): BigInt {
		return is.bigint.like(x)
			? BigInt((is.object(x) && "valueOf" in x) ? `${(x as {valueOf: () => unknown}).valueOf()}` : `${x}`)
			: throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to bigint`))
	},

	/** RegExp conversions */
	regexp(x: unknown): RegExp {
		if (is.string(x)) {
			if (x.startsWith("/") && x.endsWith("/"))
				x = x.substring(1, x.length - 1)
			else
				x = escape(x)
		}
		return is.regexp.like(x) ? new RegExp(`${x}`) : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to regexp`))
	},
} as const
