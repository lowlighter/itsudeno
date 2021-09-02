//Imports
import {Common} from "@core/internal/common"
import {glob, read, write} from "@tools/internal"
import {is} from "@tools/is"
import {Logger} from "@tools/log"
import {ucfirst} from "@tools/strings"
import {template} from "@tools/template"
import type {definitions} from "@tools/validate"
import {ensureDir} from "std/fs/mod.ts"
import {dirname} from "std/path/mod.ts"
import type {infered} from "@types"
const log = new Logger(import.meta.url)

//Load definitions
const indexes = new Map<string, infered>()
for (const section of ["executors", "vaults", "modules", "inventories", "reporters"]) {
  for await (const {path} of glob(`${section}/**/mod.yml`))
    await build(path)
}
await mods()

/** Build it.ts and mod.ts */
async function build(path: string) {
  //Load definition
  const mod = await Common.about(path)
  log.info(`processing ${mod.name}`)

  //Generate it.ts
  {
    const templated = await template(await read(`it/${mod.section}.ejs`, {base: import.meta.url}), {mod, generate}, {mode: "ejs"})
    log.v(`saving ${mod.paths.it}`)
    await ensureDir(dirname(mod.paths.it))
    await write(mod.paths.it, templated)
  }

  //Generate mod.ts
  {
    const templated = await template(await read(`it/mod.ejs`, {base: import.meta.url}), {mod}, {mode: "ejs"})
    log.v(`saving ${mod.paths.mod}`)
    await ensureDir(dirname(mod.paths.mod))
    await write(mod.paths.mod, templated)
  }

  //Index mod
  if (!indexes.has(mod.section))
    indexes.set(mod.section, {})
  const index = indexes.get(mod.section)
  index[mod.name] = mod
}

/** Build mod.ts section */
async function mods() {
  for (const [section, mods] of indexes.entries()) {
    log.v(`indexing ${section}`)
    const templated = await template(await read("mod/mod.ejs", {base: import.meta.url}), {section: ucfirst(section), mods: Object.values(mods)}, {mode: "ejs"})
    await write(`/core/generated/${section}/mod.ts`, templated)
  }
}

/** Build typings */
function generate(definition: definitions | null, mode: string, {output = [] as string[]} = {}) {
  //Skip if no arguments allowed
  if (is.null(definition))
    return ""

  //Process definition schemas
  for (let [key, {type, description, required = false, default: defaulted, optional = false, aliases = []}] of Object.entries(definition)) {
    output.push(`/** ${description ?? `(${key})`} */`)

    //Recursive typing generation
    if (is.object(type)) {
      output.push(`${key}${mode === "raw" ? "?" : ""}: {`)
      generate(type, mode, {output})
      output.push(`}`)
      continue
    }

    //Handle maps type
    if (/\{\}$/.test(type))
      type = `{[key:string]:${(type as string).replace(/\{\}$/, "")}}`

    //Handle mode
    switch (mode) {
      //Raw args
      case "raw": {
        output.push(`${key}?: ${type}${required ? "" : " | null"}`)
        for (const alias of aliases) {
          output.push(`/** ${description ?? `(${alias})`} (alias for ${key}) */`)
          output.push(`${alias}?: ${type}${required ? "" : " | null"}`)
        }
        break
      }
      //Args
      case "args": {
        output.push(`${key}: ${type}${(required) || (!is.void(defaulted)) ? "" : " | null"}`)
        break
      }
      //Past
      case "past": {
        output.push(`${key}: ${type}${optional ? " | null" : ""}`)
        break
      }
      //Result
      case "result": {
        output.push(`${key}: ${type}${optional ? " | null" : ""}`)
        break
      }
    }
  }

  //Filter and indent generated typings
  return output.filter(line => line).join("\n")
}
