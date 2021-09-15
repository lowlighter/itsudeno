//Imports
import {Common} from "@core/internal/common"
import type {before, definition, meta, outcome, payload, result} from "@core/executors"
import {remove, write} from "@tools/internal"
import {is} from "@tools/is"
import {Logger} from "@tools/log"
import {deepmerge} from "@tools/std"
import type {strategy} from "@tools/validate"
import {stripColor} from "std/fmt/colors.ts"
import {toFileUrl} from "std/path/mod.ts"
import {minify} from "y/terser"
import {ItsudenoError} from "@errors"
import {Modules} from "@modules"
import type {loose} from "@types"
const log = new Logger(import.meta.url)
const imap = "imports.json"

/**
 * Executor
 *
 * This is a common abstraction for all executors which ensure that all subsequents executors have required methods.
 * It is designed to centralize all logic in a single place (correct typing, implementation autoloading, validations, etc.)
 * Only `executor.apply()` needs to be actually implemented in child classes.
 */
export abstract class Executor<raw, args> extends Common<definition> {
  /** Constructor */
  constructor({url, definition, defaults = null}: {url: string, definition: definition, defaults?: null | Partial<raw>}) {
    super({url, definition})
    this.scope = `itsudeno.${this.name}.${crypto.randomUUID()}` as string
    this.defaults = defaults
  }

  /** Execution scope */
  protected readonly scope

  /** Defaults arguments */
  protected readonly defaults

  /** Clean scope from a result-like object */
  protected return<T extends {code: number, stdout: string, stderr: string}>(result: T) {
    const regex = new RegExp(`<${this.scope}>\\s*(?<content>[\\s\\S]*)\\s*</${this.scope}>`)
    const {code, stdout, stderr} = result
    const {content = ""} = stdout.match(regex)?.groups ?? {}
    log.vvv(`exit code: ${code}`)
    log.vvv(`stdout: ${stripColor(stdout.trim())}`)
    log.vvv(`stderr: ${stripColor(stderr.trim())}`)
    return {
      code,
      module: JSON.parse(content),
      stdout: stdout.replace(regex, "").trim(),
      stderr: stderr.replace(regex, "").trim(),
    }
  }

  /** Apply executor */
  protected async apply(result: before<raw, args>, payload: string) {
    log.v(`${this.name} → apply`)
    const executor = this.autoload()
    if (Executor.prototype.apply === executor.prototype.apply)
      throw new ItsudenoError.Unsupported(`${this.name}: apply() is not implemented`)
    return await executor.prototype.apply.call(this, result, payload) as result
  }

  /** Arguments validator */
  protected async prevalidate(args: raw | null, {context, strategy, strict}: {context?: loose, strategy?: strategy, strict?: boolean} = {}) {
    log.v(`${this.name} → prevalidate`)
    return await this.validate<raw, args>(args, this.definition.args, {mode: "input", context, strategy, strict})
  }

  /** Execute executor */
  async call(module: payload, args = null as raw | null, context = {} as loose) {
    //Use defaults values if they exists
    if (!is.null(this.defaults))
      args = deepmerge(this.defaults, args ?? {}) as raw

    //Create empty executor result
    log.v(`${this.name} → call ${module.name}`)
    const outcome = Executor.outcome<raw, args>({meta: {executor: this.index, scope: this.scope, target: module.target}, module, args: {} as unknown as args})
    try {
      //Argument validation and transformations
      outcome.args = {raw: args} as ({raw: raw} & args)
      Object.assign(outcome.args, await this.prevalidate(args, {context}))

      //Resolve module context
      if (!(module.name in Modules))
        throw new ItsudenoError.Module(`unknown module: ${module.name}`)
      const Module = Modules[module.name as keyof typeof Modules]
      module.args = await Module.prevalidate(module.args, context)

      //Controller execution
      if ((Module.definition as loose).controller) {
        log.v(`${this.name} → (module execution forced on controller)`)
        outcome.result = {code: 0, stdout: "", stderr: "", module: await Module.call(module.args, context)}
      }
      //Remote execution
      else {
        const payload = await this.bundle(module)
        outcome.result = await Executor.prototype.apply.call(this, outcome, payload)
      }
    }
    //Handle errors
    catch (error) {
      outcome.failed = true
      outcome.error = `${error}`
    }
    finally {
      //Compute metadata
      outcome.completed = new Date()
      outcome.success = !outcome.failed
    }
    return outcome
  }

  /** Bundle payload */
  private async bundle({name, args}: payload) {
    //Create payload
    const content = `import {Modules} from "@modules";["<${this.scope}>", JSON.stringify(await Modules['${name}'].call(${JSON.stringify(args)})), "</${this.scope}>"].map(line => console.log(line))`
    log.vvv(`preparing payload: ${content}`)
    let bundle = ""
    let temp = ""
    try {
      //Bundle payload
      temp = `${await Deno.makeTempFile({prefix: "itsudeno_"})}.ts`
      log.vvv(`bundling payload: ${temp}`)
      await write(temp, content, {base: "//"})
      const {files} = await Deno.emit(toFileUrl(temp), {bundle: "classic", check: false, importMapPath: imap})
      for (const [file, content] of Object.entries(files)) {
        //Skip imports maps
        if (file.endsWith(".map"))
          continue

        //Encode payload as base64 to avoid quotes issues
        const blob = new Blob([(await minify(content)).code], {type: "application/javascript"})
        const base64 = await new Promise<string>(solve => {
          const reader = new FileReader()
          reader.onload = event => solve(event.target?.result as string)
          reader.readAsDataURL(blob)
        })
        bundle = base64.replace("data:application/javascript;base64,", "")
      }
      //Payload
      const payload = `eval(atob("${bundle}"))`
      log.vvv(`payload size: ${payload.length}`)
      return payload
    }
    //Handle errors
    catch (error) {
      throw new ItsudenoError.Executor(`bundling payload failed: ${error.message}`)
    }
    finally {
      //Clean temporary files
      if (temp) {
        log.vvv(`cleaning payload: ${temp}`)
        try {
          await remove(temp, {base: "//"})
        }
        catch {
          //Ignore errors
        }
      }
    }
  }

  /** Create an empty executor result */
  private static outcome<raw, args>({meta, args, module}: {meta: meta, args: args, module: payload}): outcome<raw, args> {
    return {meta, args, module, result: {}, error: null, failed: false, success: true, completed: null} as outcome<raw, args>
  }
}
