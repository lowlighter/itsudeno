//Imports
import {is} from "@tools/is"
import {strcase} from "@tools/strings"
import {parse} from "std/encoding/yaml.ts"
import {exists as existsAsync, existsSync, expandGlob} from "std/fs/mod.ts"
import {common, dirname, fromFileUrl, isAbsolute, join} from "std/path/mod.ts"
import {ItsudenoError} from "@errors"
import type {loose} from "@types"

/** Itsudeno root path */
const root = toPath(join(dirname(import.meta.url), "../.."))

/** Normalize path with forward slashes */
function normalize(path: string) {
  return path.replaceAll("\\", "/")
}

/** Force file path */
function toPath(path: string) {
  try {
    return normalize(fromFileUrl(path))
  }
  catch {
    return normalize(path)
  }
}

/** Resolve a path within project directory */
export function resolve(path: string, {base = "", full = true, output = "file"} = {}) {
  //Force file paths
  path = toPath(path)
  base = toPath(base)

  //Ignore resolution
  if (base === "//")
    return output === "directory" ? dirname(path) : path

  //Handle file path set as base path
  try {
    if ((base) && ((Deno.statSync(base)).isFile))
      base = dirname(base)
  }
  catch {
    //Ignore errors
  }

  //Resolve relative paths from project root
  if (!isAbsolute(path))
    path = normalize(join(base, path))
  path = normalize(path.replace(common([root, path], "/"), ""))

  //Set path from project root path
  if ((full) && (!path.startsWith(root)))
    path = normalize(join(root, path))

  //Resolved path
  return output === "directory" ? dirname(path) : path
}

/** Read file content */
export function read(path: string, options: {base?: string, sync: true}): string
export function read(path: string, options?: {base?: string, sync?: false}): Promise<string>
export function read(path: string, {base = "", sync = false} = {}) {
  try {
    if (is.url.remote(path)) {
      if (sync)
        throw new ItsudenoError.Unsupported(`unsupported sync mode when path is an url`)
      return fetch(path).then(response => response.text())
    }
  }
  catch {
    //Ignore errors
  }
  path = resolve(path, {base})
  return sync ? Deno.readTextFileSync(path) : Deno.readTextFile(path)
}

/** Write file content */
export function write(path: string, content: string, options: {base?: string, sync: true}): void
export function write(path: string, content: string, options?: {base?: string, sync?: false}): Promise<void>
export function write(path: string, content: string, {base = "", sync = false} = {}) {
  path = resolve(path, {base})
  return sync ? Deno.writeTextFileSync(path, content) : Deno.writeTextFile(path, content)
}

/** Remove file */
export function remove(path: string, options: {base?: string, sync: true}): void
export function remove(path: string, options?: {base?: string, sync?: false}): Promise<void>
export function remove(path: string, {base = "", sync = false} = {}) {
  path = resolve(path, {base})
  return sync ? Deno.removeSync(path) : Deno.remove(path)
}

/** Parse YAML file */
export function yaml<T = loose>(path: string, options: {base?: string, sync: true}): T
export function yaml<T = loose>(path: string, options?: {base?: string, sync?: false}): Promise<T>
export function yaml(path: string, {base = "", sync = false} = {}) {
  return sync ? parse(read(path, {base, sync})) : read(path, {base}).then(content => parse(content))
}

/** Search file with glob pattern */
export function glob(path: string, {base = "", directories = false, exclude = []} = {}) {
  path = resolve(path, {base})
  return expandGlob(path, {root: base, exclude, includeDirs: directories, extended: true, globstar: true, caseInsensitive: true})
}

/** Tag ES module */
export function esm(url: string, {case: _case = "dot"} = {}) {
  return strcase(resolve(url, {base: root, output: "directory", full: false}), {from: "slash", to: _case})
}

/** Check if path exists */
export function exists(path: string, options: {base?: string, sync: true}): boolean
export function exists(path: string, options?: {base?: string, sync?: false}): Promise<boolean>
export function exists(path: string, {base = "", sync = false} = {}) {
  path = resolve(path, {base})
  return sync ? existsSync(path) : existsAsync(path)
}
