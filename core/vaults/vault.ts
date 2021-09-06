//Imports
import {Common} from "@core/internal/common"
import type {definition} from "@core/vaults"
import {Logger} from "@tools/log"
import type {strategy} from "@tools/validate"
import {settings} from "@settings"
import type {infered, loose, primitive} from "@types"
const log = new Logger(import.meta.url)

/**
 * Vault abstraction
 *
 * This is a common abstraction for all vaults which ensure that all subsequents vaults have required methods.
 */
export abstract class Vault<raw, args> extends Common<definition, raw> {
  /** Decrypt a secret */
  abstract get(key: string): Promise<primitive>

  /** Crypt a secret and store updated value */
  abstract set(key: string, value: primitive): Promise<this>

  /** Delete a secret */
  abstract delete(key: string): Promise<this>

  /** List secrets keys */
  abstract list(): Promise<string[]>

  /** Check if a secret exists */
  abstract has(key: string): Promise<boolean>

  /** Arguments validator */
  protected async prevalidate(args?: raw, {context, strategy, strict}: {context?: loose, strategy?: strategy, strict?: boolean} = {}) {
    log.v(`${this.name} → prevalidate`)
    return await this.validate<raw, args>(args ?? {} as raw, this.definition.args, {mode: "input", context: {...context, it: {settings}}, strategy, strict}) as infered
  }

  /** Open vault */
  static async open<raw>(args?: raw) {
    const implementation = this.autoload() as {new(args?: raw): Vault<infered, infered>}
    return await new implementation(args).ready
  }
}
