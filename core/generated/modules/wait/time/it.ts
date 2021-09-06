//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Module} from "@core/modules"
import type {before as _before, initialized as _initialized, mcall, outcome as _outcome} from "@core/modules"
import type {loose} from "@types"

/** Wait a certain amount of time before continuing */
export class WaitTimeModule extends Module<raw, args, past, result> {
  /** Constructor */
  constructor() {
    super(WaitTimeModule)
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
    "description": "Wait a certain amount of time before continuing\n",
    "controller": true,
    "args": {
      "days": {"description": "Days", "type": "number", "match": ["positive", "nonzero"], "default": 0, "alias": ["d"]},
      "hours": {"description": "Hours", "type": "number", "match": ["positive", "nonzero"], "default": 0, "alias": ["h"]},
      "minutes": {"description": "Minutes", "type": "number", "match": ["positive", "nonzero"], "default": 0, "alias": ["m", "min"]},
      "seconds": {"description": "Seconds", "type": "number", "match": ["positive", "nonzero"], "default": 0, "alias": ["s", "sec"]},
      "milliseconds": {"description": "Seconds", "type": "number", "match": ["positive", "nonzero"], "default": 0, "alias": ["ms"]},
    },
    "past": null,
    "result": null,
    "maintainers": ["lowlighter"],
  }
}
export {WaitTimeModule as Module}

/** Input arguments */
export interface raw {
  /** Days */
  days?: number | null
  /** Hours */
  hours?: number | null
  /** Minutes */
  minutes?: number | null
  /** Seconds */
  seconds?: number | null
  /** Seconds */
  milliseconds?: number | null
}

/** Validated and transformed arguments */
export interface args {
  /** Days */
  days: number
  /** Hours */
  hours: number
  /** Minutes */
  minutes: number
  /** Seconds */
  seconds: number
  /** Seconds */
  milliseconds: number
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
