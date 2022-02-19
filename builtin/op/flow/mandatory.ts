//Imports
import {ItsudenoError} from "../../meta/errors.ts"
import {throws} from "../flow/throws.ts"
import {is} from "../is/type.ts"

/** Mandatory value test */
export function mandatory(x:unknown):typeof x {
    return is.void(x) ? throws(new ItsudenoError.Reference("missing mandatory value")) : x
}