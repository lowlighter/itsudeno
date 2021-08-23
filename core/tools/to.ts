//Imports
import {is} from "@tools/is"
import {ItsudenoError} from "@errors"

/** Converters */
export const to = {
  any(x: unknown) {
    return x
  },
  boolean(x: unknown) {
    if (is.boolean(x))
      return x
    if (is.boolean.like(x))
      return (x === "true") || (x === "yes")
    throw new ItsudenoError.Unsupported(`unsupported type conversion to boolean: ${JSON.stringify(x)}`)
  },
  string(x: unknown) {
    if ((is.null(x)) || (is.void(x)))
      return ""
    if ((is.object(x)))
      return JSON.stringify(x)
    return String(x)
  },
  number(x: unknown) {
    if (is.number.like(x))
      return Number(x)
    throw new ItsudenoError.Unsupported(`unsupported type conversion to number: ${JSON.stringify(x)}`)
  },
  date(x: unknown) {
    if (is.date.like(x))
      return new Date(x)
    throw new ItsudenoError.Unsupported(`unsupported type conversion to date: ${JSON.stringify(x)}`)
  },
}
