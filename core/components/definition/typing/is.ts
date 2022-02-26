/** Typing assertions */
export const is = {
	/** Generic assertions */
	unknown:Object.assign(function(_: unknown): _ is unknown {
		return true
	}, {
		like(_:unknown): _ is unknown {
			return true
		}
	}),

	/** Void assertions */
	void: Object.assign(function(x: unknown): x is void {
		return x === undefined
	}, {
		like(x: unknown): x is void|"undefined" {
			return is.void(x) || (x === "undefined")
		},
	}),

	/** Null assertions */
	null: Object.assign(function(x: unknown): x is null {
		return x === null
	}, {
		like(x: unknown):x is null|"null" {
			return is.null(x) || (x === "null")
		},
	}),

	/** Boolean assertions */
	boolean: Object.assign(function(x: unknown): x is boolean {
		return typeof x === "boolean"
	}, {
		like(x: unknown):x is boolean|"true"|"false"|"yes"|"no" {
			return is.boolean(x) || (x === "true") || (x === "false") || (x === "yes") || (x === "no")
		},
		truthy(x:unknown):x is true|"true"|"yes" {
			return is.boolean(x) ? x : ((x === "true") || (x === "yes"))
		},
		falsy(x:unknown):x is false|"false"|"no" {
			return is.boolean(x) ? x : ((x === "false") || (x === "no"))
		}
	}),

	/** Number assertions */
	number: Object.assign(function(x: unknown): x is number {
		return typeof x === "number"
	}, {
		like(x: unknown) {
			return is.number(x) || ["NaN", "Infinity", "-Infinity"].includes(`${x}`) || ((is.string(x)) && (!is.number.nan(Number(x)))) || is.bigint.like(x)
		},
		nan(x: unknown): x is number {
			return is.number(x) && Number.isNaN(x)
		},
		finite(x: unknown): x is number {
			return is.number(x) && Number.isFinite(x)
		},
		integer(x: unknown): x is number {
			return is.number(x) && Number.isInteger(x)
		},
		float(x: unknown): x is number {
			return is.number.finite(x)
		},
		positive(x: unknown): x is number {
			return is.number(x) && (x >= 0)
		},
		negative(x: unknown): x is number {
			return is.number(x) && (x <= 0)
		},
		zero(x: unknown): x is number {
			return is.number(x) && (x === 0)
		},
		percentage(x: unknown): x is number {
			return is.number(x) && (x >= 0) && (x <= 1)
		},
	}),

	/** String assertions */
	string: Object.assign(function(x: unknown): x is string {
			return typeof x === "string"
	}, {
		like(_:unknown) {
			return true
		},
	}),

	/** Object assertions */
	object:Object.assign(function (x:unknown):x is Record<PropertyKey, unknown> {
		return typeof x === "object"
	}, {
		like(x:unknown) {
			return is.object(x) || is.object.parseable(x)
		},
		empty(x:unknown):x is null|Record<PropertyKey, never> {
			return is.object(x) && (!Object.keys(x ?? {}).length)
		},
		parseable(x:unknown):x is string|{toJSON:() => string} {
			try {
				JSON.parse((is.object(x) && "toJSON" in x) ? (x as {toJSON:() => string}).toJSON() : `${x}`)
				return true
			}
			catch {
				return false
			}
		},
		stringifiable(x:unknown) {
			try {
				JSON.stringify(x)
				return true
			}
			catch {
				return false
			}
		}
	}),

	/** Function assertions */
	function:Object.assign(function (x:unknown):x is Function {
    return typeof x === "function"
	}, {
		like(x:unknown) {

		}
	}),

	/** URL assertions */
	url:Object.assign(function(x: unknown):x is URL {
		return x instanceof URL
	}, {
		like(x:unknown):x is URL {
			if (is.url(x))
			return true
		try {
			new URL(`${x}`)
			return true
		}
		catch {
			return false
		}
		}
	}),

	/** Date assertions */
	date: Object.assign(function(x: unknown): x is Date {
		return x instanceof Date
	}, {
		like(x: unknown): x is number | string | Date {
			if ((!is.string(x)) && (!is.number(x)) && (!is.date(x)))
				return false
			return !is.number.nan(new Date(x).getTime())
		},
	}),

	/** BigInt assertions */
	bigint:Object.assign(function(x:unknown): x is BigInt {
		return typeof x === "bigint"
	}, {
		like(x:unknown) {
			return is.bigint(x) || /^\d+n?$/.test((is.object(x) && "valueOf" in x) ? `${(x as {valueOf:() => unknown}).valueOf()}` : `${x}`)
		}
	}),

	/** RegExp assertions */
	regexp:Object.assign(function(x:unknown): x is RegExp {
		return x instanceof RegExp
	}, {
		like(x:unknown) {
			if (is.regexp(x))
				return true
			try {
				new RegExp(`${x}`)
				return true
			}
			catch {
				return false
			}
		}
	}),

	/** Extra assertions */
	x:{
		net:{
			port(x:unknown) {
				return is.number.integer(x) && (x >= 1) && (x <= 65535)
			}
		}
	}

} as const
