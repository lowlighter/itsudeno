//Imports
import {posix, win32} from "std/path/mod.ts"
import {ItsudenoError} from "@errors"

export const is = { 
/** Generic assertions */
  unknown(_:unknown) {
      return true
  },
/** Void assertions */

    void:Object.assign(function(x:unknown):x is undefined {
        return x === undefined
    },
      {
        like(x:unknown) {
          return is.void(x) || (x === "undefined")
        }
      }),

/** Null assertions */

    null:Object.assign(function(x: unknown): x is null {
        return x === null
    }, {
      like(x:unknown) {
        return is.null(x) || (x === "null")
      }
    }),

/** Boolean assertions */

    boolean: Object.assign(function(x: unknown): x is boolean {
        return typeof x === "boolean"
    }, {
        like(x: unknown) {
        return is.boolean(x) || (x === "true") || (x === "false") || (x === "yes") || (x === "no")
        },
    }),


/** Number assertions */

  number: Object.assign(function(x: unknown): x is number {
    return typeof x === "number"
  }, {
    like(x: unknown) {
      return is.number(x) || ["NaN", "Infinity", "-Infinity"].includes(`${x}`) || ((is.string(x)) && (!is.number.nan(Number(x))))
    },
    nan(x: unknown): x is number {
      return is.number(x) && Number.isNaN(x)
    },
    finite(x:unknown): x is number {
      return is.number(x) && Number.isFinite(x)
    },
    integer(x: unknown): x is number {
      return is.number(x) && Number.isInteger(x)
    },
    float(x: unknown): x is number {
      return is.number(x) && Number.isFinite(x)
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

  string: Object.assign(
    Object.defineProperties(function(x: unknown): x is string {
      return typeof x === "string"
    }, {length: {writable: true}}),
    {
      length(x: unknown, options: {min?: number, max?: number} | number = {}): x is string {
        if (!is.string(x))
          return false
        if (is.number.integer(options))
          return x.length === options
        const {min = is.number(options.max) ? 0 : 1, max = Infinity} = options
        return (x.length >= min) && (x.length <= max)
      },
    },
  ),



  }