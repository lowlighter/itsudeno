//Imports
import {Common} from "@core/internal/common"
import type {before, definition, initialized, mcall, meta, mode, outcome} from "@core/modules/types.ts"
import {Logger} from "@tools/log"
import {deepdiff} from "@tools/objects"
import {template} from "@tools/template"
import type {strategy} from "@tools/validate"
import {ItsudenoError} from "@errors"
import {settings} from "@settings"
import type {infered, loose} from "@types"
const log = new Logger(import.meta.url)

/**
 * Module
 *
 * This is a common abstraction for all modules which ensure that all subsequents modules have required methods.
 * It is designed to centralize all logic in a single place (correct typing, implementation autoloading, validations, etc.)
 * Only `module.past()`, `module.check()` and `module.apply()` needs to be actually implemented in child classes.
 */
export abstract class Module<raw, args, past, result> extends Common<definition> {
  /** Collect past state */
  protected async past(result?: initialized<raw, args>) {
    log.v(`${this.name} → past`)
    const module = this.autoload()
    if (Module.prototype.past === module.prototype.past)
      return null
    return await module.prototype.past.call(this, result) as past
  }

  /** Check configuration changes */
  protected async check(result: before<raw, args, past>) {
    log.v(`${this.name} → check`)
    const module = this.autoload()
    if (Module.prototype.check === module.prototype.check)
      throw new ItsudenoError.Unsupported(`${this.name}: check() is not implemented`)
    return await module.prototype.check.call(this, result) as result
  }

  /** Apply configuration changes */
  protected async apply(result: before<raw, args, past>) {
    log.v(`${this.name} → apply`)
    const module = this.autoload()
    if (Module.prototype.apply === module.prototype.apply)
      throw new ItsudenoError.Unsupported(`${this.name}: apply() is not implemented`)
    return await module.prototype.apply.call(this, result) as result
  }

  /** Cleanup */
  protected async cleanup() {
    log.v(`${this.name} → cleanup`)
    const module = this.autoload()
    if (Module.prototype.cleanup === module.prototype.cleanup)
      return
    await module.prototype.cleanup.call(this)
  }

  /** Arguments validator */
  async prevalidate(args?: raw, {context, strategy, strict}: {context?: loose, strategy?: strategy, strict?: boolean} = {}) {
    log.v(`${this.name} → prevalidate`)
    return await this.validate<raw, args>(args ?? null, this.definition.args, {mode: "input", context, strategy, strict, override: (context as infered)?.it?.target?.os})
  }

  /** Result validator */
  async postvalidate(args?: result, {strategy, strict, override}: {strategy?: strategy, strict?: boolean, override?: string} = {}) {
    log.v(`${this.name} → postvalidate`)
    return await this.validate<result, result>(args ?? null, this.definition.result, {mode: "output", strategy, strict, override})
  }

  /** Execute module */
  protected async call({_ = this.name, _changed: changed, _failed: failed, _skipped: skipped, _mode: mode = (settings as infered)?.env?.mode as mode, ...args}: raw & mcall<raw, args, past, result>, context: loose = {}) {
    //Create empty result and template name
    log.v(`${this.name} → call`)
    const name = await template(_, context, {safe: true})
    const outcome = Module.outcome<raw, args, past, result>({name, meta: {module: this.index, mode}, args: {} as unknown as args})
    try {
      //Argument validation and transformations
      outcome.args = {raw: args} as ({raw: raw} & args)
      Object.assign(outcome.args, await this.prevalidate(args as raw, {context}))

      //Skip if needed
      if (skipped)
        outcome.skipped = await skipped(outcome)
      if (outcome.skipped)
        return outcome

      //Collect past state and apply or check configuration changes
      outcome.past = await Module.prototype.past.call(this, outcome)
      switch (mode) {
        case "apply" as mode: {
          outcome.result = await Module.prototype.apply.call(this, outcome)
          outcome.applied = true
          break
        }
        case "check" as mode: {
          outcome.result = await Module.prototype.check.call(this, outcome)
          break
        }
      }
    }
    //Handle errors
    catch (error) {
      outcome.failed = true
      outcome.error = `${error}`
    }
    finally {
      //Override states if needed
      if (changed)
        outcome.changed = await changed(outcome)
      if (failed)
        outcome.failed = await failed(outcome)
      //Validate result
      try {
        await this.postvalidate(outcome.result, {override: (context as infered)?.it?.target?.os})
      }
      catch {
        outcome.failed = true
      }
      //Compute changes and metadata
      outcome.changes = deepdiff(outcome.past, outcome.result) ?? {}
      outcome.completed = new Date()
      outcome.success = !outcome.failed
    }
    try {
      return outcome
    }
    finally {
      this.cleanup().catch(() => null)
    }
  }

  /** Create an empty module result */
  private static outcome<raw, args, past, result>({name, meta, args}: {name: string, meta: meta, args: args}): outcome<raw, args, past, result> {
    return {name, meta, args, changes: {}, past: {}, result: {}, error: null, changed: false, applied: false, skipped: false, failed: false, success: true, completed: null} as unknown as outcome<raw, args, past, result>
  }
}
