//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Module} from "@core/modules"
import type {before as _before, initialized as _initialized, mcall, outcome as _outcome} from "@core/modules"
import type {loose} from "@types"

/** Test connection with a remote host (and eventually a remote port) */
export class NetTestModule extends Module<raw, args, past, result> {
  /** Constructor */
  constructor() {
    super(NetTestModule)
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
  static readonly definition = {"description": "Test connection with a remote host (and eventually a remote port)\n", "args": {"host": {"description": "Remote host", "type": "string", "default": "localhost"}, "port": {"description": "Remote port", "type": "number", "match": ["port"]}}, "past": null, "result": null, "maintainers": ["lowlighter"]}
}
export {NetTestModule as Module}

/** Input arguments */
export interface raw {
  /** Remote host */
  host?: string | null
  /** Remote port */
  port?: number | null
}

/** Validated and transformed arguments */
export interface args {
  /** Remote host */
  host: string
  /** Remote port */
  port: number | null
}

/** Module target initializated (before execution) */
export type initialized = _initialized<raw, args>

/** Past state */

export type past = null

/** Module target status (after probing) */
export type before = _before<raw, args, past>

/** Resulting state */

export type result = null

/** Module outcome */
export type outcome = _outcome<raw, args, past, result>
