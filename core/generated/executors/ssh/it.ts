//deno-lint-ignore-file ban-unused-ignore
//deno-lint-ignore-file no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Executor} from "@core/executors"
import type {before as _before, outcome as _outcome, payload} from "@core/executors"
import type {loose} from "@types"

/** Run command through SSH */
export class SshExecutor extends Executor<raw, args> {
  /** Constructor */
  constructor({defaults}: {defaults?: Partial<raw>} = {}) {
    super({...SshExecutor, defaults})
  }

  /** Execute executor */
  static async call(module: payload, args: raw, context = {} as loose) {
    const instance = await new (this.autoload())().ready
    return instance.call(module, args, context)
  }

  /** Prepared executor */
  static async prepare(args: Partial<raw>) {
    return await new this({defaults: args}).ready
  }

  /** Url */
  static readonly url = import.meta.url

  /** Definition */
  static readonly definition = {
    "description": "Run command through SSH\n",
    "args": {
      "host": {"description": "Remote host", "required": true, "type": "string"},
      "login": {"description": "Login user", "type": "string", "default": "root"},
      "password": {"description": "Login password", "type": "string"},
      "key": {"description": "Identity file", "type": "string"},
      "port": {"description": "Remote port", "type": "number", "default": 22},
    },
    "maintainers": ["lowlighter"],
  }
}
export {SshExecutor as Executor}

/** Arguments */
export interface raw {
  /** Remote host */
  host?: string
  /** Login user */
  login?: string | null
  /** Login password */
  password?: string | null
  /** Identity file */
  key?: string | null
  /** Remote port */
  port?: number | null
}

/** Validated and transformed arguments */
export interface args {
  /** Remote host */
  host: string
  /** Login user */
  login: string
  /** Login password */
  password: string | null
  /** Identity file */
  key: string | null
  /** Remote port */
  port: number
}

/** Executor before execution */
export type before = _before<raw, args>

/** Executor outcome */
export type outcome = _outcome<raw, args>
