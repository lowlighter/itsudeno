//Imports
import {os} from "@core/setup/os"
import {esm, exists, glob, resolve, yaml} from "@tools/internal"
import {is} from "@tools/is"
import {Logger} from "@tools/log"
import {deepmerge, deferred} from "@tools/std"
import {strcase} from "@tools/strings"
import type {definitions, mode, strategy} from "@tools/validate"
import {validate} from "@tools/validate"
import {basename} from "std/path/mod.ts"
import {ItsudenoError} from "@errors"
import type {constructor, infered, loose} from "@types"
const log = new Logger(import.meta.url)

/**
 * Common class
 *
 * This is a common abstraction for mod.yml based components with deferred construction
 */
export class Common<definition, options = unknown> {
  /** Constructor */
  constructor({url, definition}: {url: string, definition: definition}, options?: options) {
    //Save definition, url and name
    this.definition = definition
    this.url = esm(url, {case: "slash"}).replace(Common.generated, "") as string
    this.name = strcase(this.url, {from: "slash", to: "dot"})
    this.index = this.name.split(".").slice(1).join(".")

    //Call async constructor
    log.v(`instantiating ${this.name}`)
    this.async(options)
  }

  /** Definition */
  readonly definition

  /** Import url */
  readonly url

  /** Name */
  readonly name

  /** Index */
  readonly index

  /** Ready state */
  readonly ready = deferred<this>()

  /** Async constructor */
  protected async async(_options?: options) {
    this.ready.resolve(this)
    return await this.ready as this
  }

  /** Arguments validator */
  protected async validate<T, U>(args: T | null, definition: definitions | null, {mode, strategy, strict, context, override = os}: {mode?: mode, strategy?: strategy, context?: loose, strict?: boolean, override?: string} = {}) {
    return await validate<T, U>(args, definition, {mode, strategy, context, strict, override})
  }

  /** Generated directory */
  private static readonly generated = "core/generated/"

  /** Generate definition and metadata */
  static async about(url: string) {
    //Resolve path and extract section
    const path = resolve(url, {base: "", full: false, output: "directory"}).replace(Common.generated, "")
    const section = path.match(/^(?<section>[\s\S]+?)\//)?.groups?.section ?? ""
    const name = strcase(path, {from: "slash", to: "dot"})
    const index = name.split(".").slice(1).join(".")
    log.v(`generating definition and metadata for ${name}`)

    //Load class name
    const suffixes = {modules: "Module", inventories: "Inventory", vaults: "Vault", executors: "Executor", reporters: "Reporter"}
    const classname = strcase(`${name.replace(section, "")}.${suffixes[section as keyof typeof suffixes] ?? section}`, {from: "dot", to: "pascal"})

    //Load definitions
    const definition = {} as infered
    const load = async (name: string) => {
      //Load definition
      const yml = resolve("mod.yml", {base: strcase(name, {from: "dot", to: "slash"})})
      if (!await exists(yml))
        throw new ItsudenoError.Internal(`could not open ${yml}`)
      const {inherits, ...partial} = await yaml(yml)

      //Load inherited definition (if exists)
      if (is.string(inherits))
        await load(inherits)

      //Merge definition
      Object.assign(definition, deepmerge(definition, partial as loose))
    }
    await load(name)

    //Load implementations
    const implementations = []
    for await (const {name} of glob("*.ts", {base: path})) {
      if (!/test\.ts$/.test(name))
        implementations.push(name)
    }

    //Load paths
    const paths = {
      it: resolve(`${Common.generated}${path}/it.ts`),
      mod: resolve(`${Common.generated}${path}/mod.ts`),
      examples: resolve(`${path}/examples.yml`),
    }

    //Load short description
    const about = definition.description?.split("\n").shift() ?? name

    //Definition and metadata
    return {section, path, name, index, about, classname, definition, implementations, paths, examples: [] as string[]}
  }

  /** Autoload implementation, using specific one before agnostic one */
  protected autoload() {
    return (this.constructor as typeof Common).autoload()
  }

  /** Autoload implementation, using specific one before agnostic one */
  protected static autoload() {
    log.vvv(`${this.name} is loading implementation`)
    const implementations = this.implementations.get(this.name) ?? this.implementations.get(Object.getPrototypeOf(this).name) ?? new Map()
    for (const implementation of [`${os}.ts`, "all.ts", "mod.ts"]) {
      if (implementations.has(implementation)) {
        log.vvv(`${this.name} loaded ${implementation}`)
        return implementations.get(implementation)!
      }
    }
    throw new ItsudenoError.Unsupported(`unsupported implementation for: ${os}`)
  }

  /** Implementations (internal) */
  private static readonly implementations = new Map<string, Map<string, constructor>>()

  /** Register new implementation */
  static register(url: string, implementation: constructor) {
    const name = basename(url)
    log.vvv(`registering new implementation ${name} for ${this.name}`)
    if (!this.implementations.has(this.name))
      this.implementations.set(this.name, new Map())
    this.implementations.get(this.name)!.set(name, implementation)
  }
}
