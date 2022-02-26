//Imports
import {is} from "./is.ts"
import {ItsudenoError, throws} from "../../../meta/errors.ts"
import {escape} from "../../../tools/regexp/mod.ts"

/** Typing conversions */
export const to = {

  /** Unknown conversions */
  unknown(x:unknown):unknown {
    return x
  },

  /** Void conversions */
  void(x:unknown):void {
    return is.void.like(x) ? undefined : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to void`))
  },

  /** Null conversions */
  null(x:unknown):null {
    return is.null.like(x) ? null : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to null`))
  },

  /** Boolean conversions */
  boolean(x:unknown):boolean {    
    return is.boolean.like(x) ? 
      is.boolean.truthy(x) ? true : 
      is.boolean.falsy(x) ? false :
      throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to boolean`)) : 
      throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to boolean`))
  },

  /** Number conversions */
  number(x:unknown):number {
    if ((is.string(x))&&(is.bigint.like(x)))
      x = x.replace(/n$/, "")
    return is.number.like(x) ? Number(x) : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to number`))
  },

  /** String conversions */
  string(x:unknown):string {
    return is.object.stringifiable(x) ? JSON.stringify(x) : `${x}`
  },

  /** Object conversions */
  object(x:unknown):Record<PropertyKey, unknown> {
    return is.object.like(x) ? is.object.parseable(x) ? JSON.parse((is.object(x) && "toJSON" in x) ? x.toJSON() : `${x}`) : x : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to object`))
  },

  /** Function conversions */
  /*function():Function {

  },*/

  /** URL conversions */
  url(x:unknown):URL {
    return is.url.like(x) ? new URL(`${x}`) : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to url`))
  },

  /** Date conversions */
  date(x:unknown):Date {
    return is.date.like(x) ? new Date(x) : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to date`))
  },

  /** BigInt conversions */
  bigint(x:unknown):BigInt {
    return is.bigint.like(x) ? BigInt((is.object(x) && "valueOf" in x) ? `${(x as {valueOf:() => unknown}).valueOf()}` : `${x}`) : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to bigint`))
  },

  /** RegExp conversions */
  regexp(x:unknown):RegExp {
    if (is.string(x)) {
      if (x.startsWith("/") && x.endsWith("/"))
        x = x.substring(1, x.length-1)
      else 
        x = escape(x)
    }
    return is.regexp.like(x) ? new RegExp(`${x}`) : throws(new ItsudenoError.Type(`cannot convert ${Deno.inspect(x)} to regexp`))
  },

} as const 