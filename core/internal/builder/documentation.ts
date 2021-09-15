//Imports
import {Common} from "@core/internal/common"
import {glob, read, write, yaml} from "@tools/internal"
import {resolve as _resolve} from "@tools/internal"
import {Logger} from "@tools/log"
import {ucfirst} from "@tools/strings"
import {template} from "@tools/template"
import {stringify} from "std/encoding/yaml.ts"
import {ensureDir} from "std/fs/mod.ts"
import {dirname} from "std/path/mod.ts"
import {Marked} from "x/markdown@v2.0.0/mod.ts"
import type {infered, loose} from "@types"
const log = new Logger(import.meta.url)

//Load pages
for await (const {path} of glob("docs/.content/pages/**/*.md"))
  await build(path, {type: "page"})

//Load components
const indexes = new Map<string, infered>()
for (const section of ["executors", "vaults", "modules", "inventories", "reporters"]) {
  for await (const {path} of glob(`${section}/**/mod.yml`)) {
    const mod = await Common.about(path)
    mod.examples = (await yaml<loose[]>(mod.paths.examples, {base: "//"}).catch(() => [])).map(example => stringify(example)) as string[]
    await build(`docs/.content/partials/${section}/mod.md`, {type: section, context: {mod}})
  }
}

//Load components list
for (const [section, list] of indexes.entries())
  await build(`docs/.content/partials/${section}/index.md`, {type: `list/${section}`, context: {list: [...Object.values(list)]}})

/** Build pages */
async function build(path: string, {type, context = {}}: {type: string, context?: loose}) {
  //Parse markdown
  log.info(`processing: ${path}`)
  const {meta} = Marked.parse(await read(path))
  let destination = path

  //Handle type
  switch (true) {
    //Components
    case ["executors", "vaults", "modules", "inventories", "reporters"].includes(type): {
      //Load definition
      type ValueType<T> = T extends Promise<infer U> ? U : T
      const {mod} = context as {mod: ValueType<ReturnType<typeof Common.about>>}
      const {index, about: description} = mod
      destination = `${type}/${index}`
      Object.assign(meta, context, {title: `${ucfirst(type)}: ${index}`, description})

      //Index mod
      {
        if (!indexes.has(mod.section))
          indexes.set(mod.section, {})
        const index = indexes.get(mod.section)
        index[mod.name] = mod
      }
      break
    }
    //List
    case /^list\//.test(type): {
      Object.assign(meta, context)
      destination = `${type.replace(/^list\//, "")}/index`
      break
    }
  }

  //Generate content
  const content = [
    await partial(`components/head.ejs`, meta),
    Marked.parse(await template(await read(path), meta, {mode: "ejs"})).content,
    await partial(`components/foot.ejs`, meta),
  ].join("\n")

  //Save generated content
  path = resolve(destination)
  log.v(`saving ${path}`)
  await ensureDir(dirname(path))
  await write(path, content)
}

/** Resolve a path within project documentation directory */
function resolve(path: string) {
  return _resolve(`docs/${_resolve(path, {full: false}).replace(/^docs\/\.content\/pages\//, "").replace(/.md$/, ".html").replace(/(?<!\.(?:md|html))$/, ".html")}`)
}

/** Include a partial template */
async function partial(path: string, context: loose = {}) {
  Object.assign(context, {
    use: {
      component(name: string, context: loose = {}) {
        return partial(`components/${name}.ejs`, context)
      },
    },
    example,
  })
  return await template(await read(`docs/.content/partials/${path}`), context, {mode: "ejs"})
}

/** Include an example */
async function example(name: string) {
  const {language = ""} = name.match(/\.(?<language>\w+)$/)?.groups ?? {}
  return `${"```"}${language}\n${await read(`docs/examples/${name}`)}\n${"```"}`
}
