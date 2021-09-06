//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Module} from "@core/modules"
import type {before as _before, initialized as _initialized, mcall, outcome as _outcome} from "@core/modules"
import type {loose} from "@types"

/** Ping an host using ICMP */
export class NetPingModule extends Module<raw, args, past, result> {
  /** Constructor */
  constructor() {
    super(NetPingModule)
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
    "description": "Ping an host using ICMP\n",
    "args": {"host": {"description": "Host to ping", "type": "string", "required": true, "examples": ["itsudeno.land", "8.8.8.8"]}, "packets": {"description": "Number of packets to send", "type": "number", "match": ["positive", "integer", "nonzero"], "default": 4}},
    "past": null,
    "result": {
      "host": {"description": "Pinged host", "type": "string", "examples": ["itsudeno.land"]},
      "ip": {"description": "Pinged host ip address (may be null if dns resolution failed)", "type": "string", "optional": true, "examples": ["172.67.154.242"]},
      "transmitted": {"description": "Number of transmitted packets", "type": "number", "match": ["positive", "integer"]},
      "received": {"description": "Number of received packets", "type": "number", "match": ["positive", "integer"]},
      "loss": {"description": "Packets loss percentage", "type": "number", "match": ["percentage"]},
    },
    "maintainers": ["lowlighter"],
  }
}
export {NetPingModule as Module}

/** Input arguments */
export interface raw {
  /** Host to ping */
  host?: string
  /** Number of packets to send */
  packets?: number | null
}

/** Validated and transformed arguments */
export interface args {
  /** Host to ping */
  host: string
  /** Number of packets to send */
  packets: number
}

/** Module target initializated (before execution) */
export type initialized = _initialized<raw, args>

/** Past state */

export type past = null

/** Module target status (after probing) */
export type before = _before<raw, args, past>

/** Resulting state */

export interface result {
  /** Pinged host */
  host: string
  /** Pinged host ip address (may be null if dns resolution failed) */
  ip: string | null
  /** Number of transmitted packets */
  transmitted: number
  /** Number of received packets */
  received: number
  /** Packets loss percentage */
  loss: number
}

/** Module outcome */
export type outcome = _outcome<raw, args, past, result>
