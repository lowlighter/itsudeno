//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Module} from "@core/modules"
import type {before as _before, initialized as _initialized, mcall, outcome as _outcome} from "@core/modules"
import type {loose} from "@types"

/** Log a message */
export class LogModule extends Module<raw, args, past, result> {
  /** Constructor */
  constructor() {
    super(LogModule)
  }

  /** Execute module */
  static async call(args: raw & mcall<raw, args, past, result>, context = {} as loose) {
    const instance = await new (this.autoload())().ready
    return instance.call(args ?? {}, context)
  }

  /** Arguments validator */
  static async prevalidate(args: raw & mcall<raw, args, past, result>, context = {} as loose) {
    const instance = await new (this.autoload())().ready
    return instance.prevalidate(args, {context})
  }

  /** Url */
  static readonly url = import.meta.url

  /** Definition */
  static readonly definition = {"description": "Log a message\n", "controller": true, "args": {"message": {"description": "Message to log", "type": "string", "required": true, "aliases": ["msg"]}}, "past": null, "result": {"message": {"description": "Logged message", "type": "string"}}, "maintainers": ["lowlighter"]}
}
export {LogModule as Module}

/** Input arguments */
export interface raw {
  /** Message to log */
  message?: string
  /** Message to log (alias for message) */
  msg?: string
}

/** Validated and transformed arguments */
export interface args {
  /** Message to log */
  message: string
}

/** Module target initializated (before execution) */
export type initialized = _initialized<raw, args>

/** Past state */

export type past = null

/** Module target status (after probing) */
export type before = _before<raw, args, past>

/** Resulting state */

export interface result {
  /** Logged message */
  message: string
}

/** Module outcome */
export type outcome = _outcome<raw, args, past, result>
