//Imports
import {root} from "core/meta/root.ts"
import {dirname} from "std/path/mod.ts"

/** ES module path (relative to project root) */
export function esm(url:string, {dir = false} = {}) {
  url = root.relative(url)
  return dir ? dirname(url) : url
}
