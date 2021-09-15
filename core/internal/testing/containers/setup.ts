//Imports
import {os} from "@core/setup/os"
import {glob, resolve} from "@tools/internal"
import {Logger} from "@tools/log"
import {run} from "@tools/run"
import {strcase} from "@tools/strings"
const log = new Logger(import.meta.url)

//Build docker images
const images = [] as string[]
const jobs = []
for await (const {path} of glob(`**/Dockerfile`, {base: import.meta.url}))
  jobs.push(await build(path))
await Promise.all(jobs)
log.info(`all docker images built successfully`)
export {images}

/** Build and prepare docker image */
async function build(path: string) {
  path = path.replace("Dockerfile", "")
  const name = strcase(resolve(path).replace(`${resolve("", {base: import.meta.url})}`, ""), {from: "slash", to: "snake"})
  if (name.split("_").at(0) !== os) {
    log.v(`skipping docker image ${name} (incompatible OS)`)
    return
  }
  images.push(name)
  log.v(`building docker image ${name}`)
  const {stderr} = await run(`docker build -t ${name} ${path}`)
  if (stderr)
    log.warn(stderr)
  log.v(`built docker image ${name}`)
}
