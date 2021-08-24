//Imports
import {glob, read, write} from "@tools/internal"
import {resolve as _resolve} from "@tools/internal"
import {Logger} from "@tools/log"
import {template} from "@tools/template"
import {ensureDir} from "std/fs/mod.ts"
import {dirname} from "std/path/mod.ts"
import {Marked} from "x/markdown@v2.0.0/mod.ts"
const log = new Logger(import.meta.url)

/** Resolve a path within project documentation directory */
function resolve(path: string) {
  return _resolve(`docs/generated/${_resolve(path, {full: false}).replace(/^docs.pages./, "").replace(/.md$/, ".html")}`)
}

//Load pages
for await (const {path} of glob("docs/pages/**/*.md"))
  await build(path)

/** Build pages */
async function build(path: string) {
  //Parse markdown
  log.info(`processing: ${path}`)
  const {content: body, meta} = Marked.parse(await read(path))

  //Generate content
  const content = [
    await template(await read("docs/partials/components/head.ejs"), meta, {mode: "ejs"}),
    await template(body, meta, {mode: "ejs"}),
    await template(await read("docs/partials/components/foot.ejs"), meta, {mode: "ejs"}),
  ].join("\n")

  //Save generated content
  path = resolve(path)
  log.v(`saving ${path}`)
  await ensureDir(dirname(path))
  await write(path, content)
}
