//Imports
import {root} from "./root.ts"
import {dirname} from "https://deno.land/std@0.123.0/path/mod.ts"

/** ES module path (relative to project root) */
export function esm(url:string, {dir = false} = {}) {
  url = root.relative(url)
  return dir ? dirname(url) : url
}
