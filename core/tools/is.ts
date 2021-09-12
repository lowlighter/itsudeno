//Imports
import {access} from "@tools/objects"
import {posix, win32} from "std/path/mod.ts"
import {ItsudenoError} from "@errors"
import type {infered} from "@types"

/** Typings assertions */
export const is = Object.assign(function(query: string, x: unknown) {
  const {path = "", args = ""} = query.match(/^(?<path>[\s\S]+?)(?:\((?<args>[\s\S]*)\))?$/)?.groups ?? {}
  if (!path)
    throw new ItsudenoError.Internal(`bad assertion query: ${query}`)
  return (access(is as infered, path) as infered)(x, ...eval(`[${args}]`))
}, {
  //Unknown asserts
  unknown(_: unknown) {
    return true
  },
  //Void asserts
  void: Object.assign(function(x: unknown): x is undefined {
    return x === undefined
  }, {
    like(x: unknown) {
      return is.void(x) || (x === "undefined")
    },
  }),
  //Null asserts
  null: Object.assign(function(x: unknown): x is null {
    return x === null
  }, {
    like(x: unknown) {
      return is.null(x) || (x === "null")
    },
  }),
  //URL asserts
  url: Object.assign(function(x: unknown) {
    if (x instanceof URL)
      return true
    try {
      new URL(x as string)
      return true
    }
    catch {
      return false
    }
  }, {
    remote(x: unknown) {
      if (is.url(x))
        return /^https?:$/.test(new URL(x as string).protocol)
      return false
    },
  }),
  //Symbol asserts
  symbol(x: unknown): x is unknown {
    return typeof x === "symbol"
  },
  //Function asserts
  //deno-lint-ignore ban-types
  function(x: unknown): x is Function {
    return typeof x === "function"
  },
  //Boolean asserts
  boolean: Object.assign(function(x: unknown): x is boolean {
    return typeof x === "boolean"
  }, {
    like(x: unknown) {
      return is.boolean(x) || (x === "true") || (x === "false") || (x === "yes") || (x === "no")
    },
  }),
  //String asserts
  string: Object.assign(
    Object.defineProperties(function(x: unknown): x is string {
      return typeof x === "string"
    }, {length: {writable: true}}),
    {
      length(x: unknown, options: {min?: number, max?: number} | number = {}): x is string {
        if (!is.string(x))
          return false
        if (is.number.nan(options))
          return x.length === options
        const {min = 0, max = Infinity} = options
        return (x.length >= min) && (x.length <= max)
      },
      filepath(x: unknown, oss = ["win32", "posix"]): x is string {
        if (!is.string(x))
          return false
        for (const os of oss) {
          const lib = {win32, posix}[os]
          if (lib) {
            try {
              lib.parse(x)
              return true
            }
            catch {
              //Ignore errors
            }
          }
        }
        return false
      },
    },
  ),
  //Number asserts
  number: Object.assign(function(x: unknown): x is number {
    return typeof x === "number"
  }, {
    like(x: unknown) {
      return is.number(x) || ((is.string(x)) && (!is.number.nan(Number(x)))) || (`${x}` === "NaN")
    },
    nan(x: unknown): x is number {
      return is.number(x) && Number.isNaN(x)
    },
    float(x: unknown): x is number {
      return is.number(x) && Number.isFinite(x)
    },
    integer(x: unknown): x is number {
      return is.number.float(x) && Number.isInteger(x)
    },
    positive(x: unknown): x is number {
      return is.number(x) && (x >= 0)
    },
    negative(x: unknown): x is number {
      return is.number(x) && (x <= 0)
    },
    nonzero(x: unknown): x is number {
      return is.number(x) && (!!x)
    },
    percentage(x: unknown): x is number {
      return is.number(x) && (x >= 0) && (x <= 1)
    },
    port(x: unknown): x is number {
      return is.number(x) && is.number.integer(x) && (x > 0) && (x < 65535)
    },
  }),
  //Array asserts
  array: Object.assign(function(x: unknown): x is unknown[] {
    return Array.isArray(x)
  }),
  //Object asserts
  object: Object.assign(function<T>(x: T): x is T {
    return (typeof x === "object") && (!is.null(x))
  }, {
    empty<T>(x: T): x is T {
      return is.object<T>(x) && (!Object.keys(x).length)
    },
    with<T>(x: T, path: string): x is T {
      try {
        access(x as infered, path)
        return true
      }
      catch {
        //Ignore errors
      }
      return false
    },
  }),
  //Date asserts
  date: Object.assign(function(x: unknown): x is Date {
    return x instanceof Date
  }, {
    like(x: unknown): x is number | string | Date {
      if ((!is.string(x)) && (!is.number(x)) && (!is.date(x)))
        return false
      const d = new Date(x as number | string | Date)
      if (!is.number.nan(d.getTime()))
        return true
      return false
    },
  }),
  //Promise asserts
  promise<T>(x: unknown): x is Promise<T> {
    return x instanceof Promise
  },
})
