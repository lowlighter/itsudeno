//Imports
import {ItsudenoError} from "@errors"
import {throws} from "core/tools/flow/throws.ts"
import {is} from "core/tools/is/type.ts"

/** Mandatory value test */
export function mandatory(x:unknown):typeof x {
    return is.void(x) ? throws(new ItsudenoError.Reference("missing mandatory value")) : x
}