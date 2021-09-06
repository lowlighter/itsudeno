//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Module} from "@core/modules"
import type {before as _before, initialized as _initialized, mcall, outcome as _outcome} from "@core/modules"
import type {loose} from "@types"

/** Run a shell command */
export class RunShellModule extends Module<raw, args, past, result> {
  /** Constructor */
  constructor() {
    super(RunShellModule)
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
    "description": "Run a shell command\n",
    "args": {
      "command": {"description": "Command to run", "type": "string", "required": true, "aliases": ["cmd"], "examples": ["echo 'hello world'"]},
      "environment": {"description": "Environment", "type": "string{}", "default": {}, "aliases": ["env"]},
      "cwd": {"description": "Current working directory", "type": "string", "match": ["filepath"]},
      "executable": {
        "description": "Shell executable options",
        "type": {
          "path": {"description": "Shell executable path", "type": "string", "match": ["filepath"], "default": "/bin/sh", "overrides": {"windows": {"default": "powershell.exe"}}},
          "options": {"description": "Shell executable options", "type": "string", "default": "", "overrides": {"windows": {"default": "-Nologo -NoProfile -NonInteractive -ExecutionPolicy Unrestricted -"}}},
        },
      },
    },
    "past": null,
    "result": {"success": {"description": "Whether command exited with a zero exit code", "type": "boolean"}, "code": {"description": "Exit code", "type": "number"}, "stdout": {"description": "Standard output", "type": "string"}, "stderr": {"description": "Standard error", "type": "string"}},
    "maintainers": ["lowlighter"],
  }
}
export {RunShellModule as Module}

/** Input arguments */
export interface raw {
  /** Command to run */
  command?: string
  /** Command to run (alias for command) */
  cmd?: string
  /** Environment */
  environment?: {[key: string]: string} | null
  /** Environment (alias for environment) */
  env?: {[key: string]: string} | null
  /** Current working directory */
  cwd?: string | null
  /** Shell executable options */
  executable?: {
    /** Shell executable path */
    path?: string | null,
    /** Shell executable options */
    options?: string | null,
  }
}

/** Validated and transformed arguments */
export interface args {
  /** Command to run */
  command: string
  /** Environment */
  environment: {[key: string]: string}
  /** Current working directory */
  cwd: string | null
  /** Shell executable options */
  executable: {
    /** Shell executable path */
    path: string,
    /** Shell executable options */
    options: string,
  }
}

/** Module target initializated (before execution) */
export type initialized = _initialized<raw, args>

/** Past state */

export type past = null

/** Module target status (after probing) */
export type before = _before<raw, args, past>

/** Resulting state */

export interface result {
  /** Whether command exited with a zero exit code */
  success: boolean
  /** Exit code */
  code: number
  /** Standard output */
  stdout: string
  /** Standard error */
  stderr: string
}

/** Module outcome */
export type outcome = _outcome<raw, args, past, result>
