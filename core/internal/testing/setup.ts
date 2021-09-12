//Imports
import {glob, resolve} from "@tools/internal"
import {Logger} from "@tools/log"
import {run} from "@tools/run"
import {strcase} from "@tools/strings"
const log = new Logger(import.meta.url)

//Create itsudeno directory
await Deno.mkdir(".itsudeno", {recursive: true})

//Build docker images
const images = []
const jobs = []
for await (const {path} of glob(`containers/**/Dockerfile`, {base: import.meta.url}))
  jobs.push(await build(path))
await Promise.all(jobs)
log.info(`all docker images built successfully`)

//Start docker images
for (let port = 4650; images.length; port++) {
  const name = images.shift()
  log.v(`starting docker image ${name}`)
  await run(`docker run -tdp ${port}:22 ${name}`)
}
log.info(`all docker images started successfully`)

//TODO: register them in a clean inventory

/** Build and prepare docker image */
async function build(path: string) {
  const name = strcase(resolve(path).replace(`${resolve("", {base: import.meta.url})}/containers`, "").replace("Dockerfile", ""), {from: "slash", to: "snake"})
  if (name.split("_").at(0) !== Deno.build.os) {
    log.v(`skipping docker image ${name} (incompatible OS)`)
    return
  }
  images.push(name)
  log.v(`building docker image ${name}`)
  await run(`docker build -t ${name} ${path}`)
  log.info(`built docker image ${name}`)
}
