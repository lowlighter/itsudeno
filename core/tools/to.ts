//Imports
import {is} from "@tools/is"
import {ItsudenoError} from "@errors"

/** Converters */
export const to = {
  any(x: unknown) {
    return x
  },
  unknown(x: unknown) {
    return x
  },
  object(x: unknown) {
    if (is.object(x))
      return x
    throw new ItsudenoError.Unsupported(`unsupported type conversion to object: ${JSON.stringify(x)}`)
  },
  function(x: unknown) {
    if (is.function(x))
      return x
    if (is.string(x)) {
      try {
        return new Function(`return ${x}`)()
      }
      catch {
        //Ignore errors
      }
    }
    throw new ItsudenoError.Unsupported(`unsupported type conversion to function: ${JSON.stringify(x)}`)
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
