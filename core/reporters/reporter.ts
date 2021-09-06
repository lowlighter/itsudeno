//Imports
import {Common} from "@core/internal/common"
import type {definition, outcome} from "@core/reporters"
import {Logger} from "@tools/log"
import type {strategy} from "@tools/validate"
import {settings} from "@settings"
import type {infered, loose} from "@types"
const log = new Logger(import.meta.url)

/**
 * Reporter abstraction
 *
 * This is a common abstraction for all reporters which ensure that all subsequents reporters have required methods.
 */
export abstract class Reporter<raw, args> extends Common<definition, raw> {
  /** Print header */
  abstract header(options: {name: string}): Promise<void>

  /** Print module report */
  abstract report(outcome: outcome): Promise<void>

  /** Arguments validator */
  protected async prevalidate(args?: raw, {context, strategy, strict}: {context?: loose, strategy?: strategy, strict?: boolean} = {}) {
    log.v(`${this.name} → prevalidate`)
    return await this.validate<raw, args>(args ?? {} as raw, this.definition.args, {mode: "input", context: {...context, it: {settings}}, strategy, strict}) as infered
  }

  /** Open reporter */
  static async open<raw>(args?: raw) {
    const implementation = this.autoload() as {new(args?: raw): Reporter<infered, infered>}
    return await new implementation(args).ready
  }
}
