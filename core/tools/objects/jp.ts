//Imports
import {search} from "y/jmespath@0.16.0"

/**  */
export function jp<T>(object:Record<PropertyKey, unknown>, query: string) {
  console.log( search(object, query), query)
    return search(object, query) as T
  }