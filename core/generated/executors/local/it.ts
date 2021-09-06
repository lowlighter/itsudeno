//deno-lint-ignore-file ban-unused-ignore
//deno-lint-ignore-file no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Executor} from "@core/executors"
import type {before as _before, outcome as _outcome, payload} from "@core/executors"
import type {loose} from "@types"

/** Run command locally */
export class LocalExecutor extends Executor<raw, args> {
  /** Constructor */
  constructor({defaults}: {defaults?: Partial<raw>} = {}) {
    super({...LocalExecutor, defaults})
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
    "description": "Run command locally\n",
    "args": {
      "shell": {
        "description": "Shell",
        "type": {"executable": {"description": "Shell executable", "type": "string", "match": ["filepath"], "default": "/bin/sh", "overrides": {"windows": {"default": "powershell.exe"}}}, "type": {"description": "Shell type", "type": "string", "values": ["posix", "powershell"], "default": "posix", "overrides": {"windows": {"default": "powershell"}}}},
      },
    },
    "maintainers": ["lowlighter"],
  }
}
export {LocalExecutor as Executor}

/** Arguments */
export interface raw {
  /** Shell */
  shell?: {
    /** Shell executable */
    executable?: string | null,
    /** Shell type */
    type?: string | null,
  }
}

/** Validated and transformed arguments */
export interface args {
  /** Shell */
  shell: {
    /** Shell executable */
    executable: string,
    /** Shell type */
    type: string,
  }
}

/** Executor before execution */
export type before = _before<raw, args>

/** Executor outcome */
export type outcome = _outcome<raw, args>
