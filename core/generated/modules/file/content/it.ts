//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Module} from "@core/modules"
import type {before as _before, initialized as _initialized, mcall, outcome as _outcome} from "@core/modules"
import type {loose} from "@types"

/** Set file content */
export class FileContentModule extends Module<raw, args, past, result> {
  /** Constructor */
  constructor() {
    super(FileContentModule)
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
  static readonly definition = {
    "description": "Set file content\n",
    "args": {"path": {"description": "File path", "type": "string", "required": true, "match": ["filepath"]}, "content": {"description": "File content", "type": "string", "required": true}},
    "past": {"content": {"description": "File content (past)", "type": "string", "optional": true}, "md5": {"description": "MD5 hash (past)", "type": "string", "optional": true}},
    "result": {"content": {"description": "File content", "type": "string"}, "md5": {"description": "MD5 hash", "type": "string"}},
    "maintainers": ["lowlighter"],
  }
}
export {FileContentModule as Module}

/** Input arguments */
export interface raw {
  /** File path */
  path?: string
  /** File content */
  content?: string
}

/** Validated and transformed arguments */
export interface args {
  /** File path */
  path: string
  /** File content */
  content: string
}

/** Module target initializated (before execution) */
export type initialized = _initialized<raw, args>

/** Past state */

export interface past {
  /** File content (past) */
  content: string | null
  /** MD5 hash (past) */
  md5: string | null
}

/** Module target status (after probing) */
export type before = _before<raw, args, past>

/** Resulting state */

export interface result {
  /** File content */
  content: string
  /** MD5 hash */
  md5: string
}

/** Module outcome */
export type outcome = _outcome<raw, args, past, result>
