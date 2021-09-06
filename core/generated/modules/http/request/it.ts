//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Module} from "@core/modules"
import type {before as _before, initialized as _initialized, mcall, outcome as _outcome} from "@core/modules"
import type {loose} from "@types"

/** Perform an HTTP request */
export class HttpRequestModule extends Module<raw, args, past, result> {
  /** Constructor */
  constructor() {
    super(HttpRequestModule)
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
    "description": "Perform an HTTP request\n",
    "args": {
      "url": {"description": "Request URL", "type": "string", "required": true},
      "method": {"description": "Request method", "type": "string", "default": "GET"},
      "headers": {"description": "Request headers", "type": "unknown{}", "default": {}},
      "body": {"description": "Request body", "type": "unknown{}", "default": {}},
      "cache": {"description": "Use cache", "type": "boolean", "default": false},
      "redirects": {"description": "Follow redirections", "type": "boolean", "default": true},
      "status": {"description": "Allowed response status codes", "type": "number[]", "default": [200]},
    },
    "past": null,
    "result": {
      "url": {"description": "Response URL", "type": "string"},
      "redirected": {"description": "Whether a redirection occured", "type": "boolean"},
      "status": {"description": "Response status", "type": {"code": {"description": "Response status code", "type": "number"}, "text": {"description": "Response status text", "type": "string"}}},
      "text": {"description": "Response data (as text)", "type": "string"},
      "data": {"description": "Response data (as object, may be null if output was not JSON parseable)", "type": "unknown{}", "optional": true},
    },
    "maintainers": ["lowlighter"],
  }
}
export {HttpRequestModule as Module}

/** Input arguments */
export interface raw {
  /** Request URL */
  url?: string
  /** Request method */
  method?: string | null
  /** Request headers */
  headers?: {[key: string]: unknown} | null
  /** Request body */
  body?: {[key: string]: unknown} | null
  /** Use cache */
  cache?: boolean | null
  /** Follow redirections */
  redirects?: boolean | null
  /** Allowed response status codes */
  status?: number[] | null
}

/** Validated and transformed arguments */
export interface args {
  /** Request URL */
  url: string
  /** Request method */
  method: string
  /** Request headers */
  headers: {[key: string]: unknown}
  /** Request body */
  body: {[key: string]: unknown}
  /** Use cache */
  cache: boolean
  /** Follow redirections */
  redirects: boolean
  /** Allowed response status codes */
  status: number[]
}

/** Module target initializated (before execution) */
export type initialized = _initialized<raw, args>

/** Past state */

export type past = null

/** Module target status (after probing) */
export type before = _before<raw, args, past>

/** Resulting state */

export interface result {
  /** Response URL */
  url: string
  /** Whether a redirection occured */
  redirected: boolean
  /** Response status */
  status: {
    /** Response status code */
    code: number,
    /** Response status text */
    text: string,
  }
  /** Response data (as text) */
  text: string
  /** Response data (as object, may be null if output was not JSON parseable) */
  data: {[key: string]: unknown} | null
}

/** Module outcome */
export type outcome = _outcome<raw, args, past, result>
