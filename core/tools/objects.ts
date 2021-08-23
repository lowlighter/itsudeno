//Imports
import {is} from "@tools/is"
import {deepmerge} from "@tools/std"
import {ItsudenoError} from "@errors"
import type {loose} from "@types"

/** Access an object path */
export function access<T = unknown>(object: unknown, path: string, {set, deleted}: {set?: unknown, deleted?: boolean} = {}) {
  const keys = path.split(".")
  while (keys.length) {
    const key = keys.shift()!
    //Set value if asked (ensure path exists by creating loose object if they does not)
    if (!is.void(set)) {
      if (!keys.length) {
        if (deleted)
          delete (object as loose)[key]
        else
          (object as loose)[key] = set
        break
      }
      else {
        //deno-lint-ignore no-extra-semi
        ;(object as loose)[key] ??= {}
      }
    }
    //Continue traversal
    if (!(key in (object as loose)))
      throw new ItsudenoError.Internal(`cannot access object path: ${path}`)
    object = (object as loose)[key] as loose
  }
  return object as T
}

/** Clone an object */
export function clone<T>(object: T) {
  return deepmerge({}, object) as T
}

/** Deep freeze */
export function deepfreeze<T>(object: T) {
  if (!is.object(object))
    return object
  for (const value of Object.values(object)) {
    if (is.object(value))
      deepfreeze(value)
  }
  return Object.freeze(object)
}

/** Deep diff */
export function deepdiff<T, U>(a: T, b: U, {intersect = true} = {}) {
  type diff = {[key: string]: diff | {past?: unknown, current: unknown}}
  const diff = {} as diff
  if (!is.object(a))
    a = {} as T
  if (!is.object(b))
    b = {} as U
  for (const key of [...new Set([...Object.keys(a), ...Object.keys(b)])]) {
    if ((intersect) && (((key in a) && (!(key in b))) || ((!(key in a) && (key in b)))))
      continue
    if ((is.object(a[key as keyof typeof a])) && (is.object(b[key as keyof typeof b]))) {
      diff[key] = deepdiff(a[key as keyof typeof a]!, b[key as keyof typeof b]!)
      continue
    }
    diff[key] = {current: b[key as keyof typeof b]}
    if (key in a)
      diff[key].past = a[key as keyof typeof a]
  }
  return diff
}
