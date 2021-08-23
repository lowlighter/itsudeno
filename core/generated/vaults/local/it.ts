//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Vault} from "@core/vaults"

/** Local vault */
export abstract class LocalVault extends Vault<raw, args> {
  /** Constructor */
  constructor(args?: raw) {
    super(LocalVault, args)
  }

  /** Url */
  static readonly url = import.meta.url

  /** Definition */
  static readonly definition = {
    "description": "Local vault\nStores secrets locally and encrypt them with AES cipher\n",
    "args": {"key": {"description": "AES cipher key", "type": "string", "match": ["length(16)", "length(24)", "length(32)"], "default": "${it.settings.vaults.local.key}"}, "path": {"description": "Vault file path", "type": "string", "match": ["filepath"], "default": "${it.settings.vaults.local.path}"}},
    "maintainers": ["lowlighter"],
  }
}
export {LocalVault as Vault}

/** Input arguments */
export interface raw {
  /** AES cipher key */
  key?: string | null
  /** Vault file path */
  path?: string | null
}

/** Validated and transformed arguments */
export interface args {
  /** AES cipher key */
  key: string
  /** Vault file path */
  path: string
}
