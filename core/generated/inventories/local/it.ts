//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Inventory} from "@core/inventories"

/** Local inventory */
export abstract class LocalInventory extends Inventory<raw, args> {
  /** Constructor */
  constructor(args?: raw) {
    super(LocalInventory, args)
  }

  /** Url */
  static readonly url = import.meta.url

  /** Definition */
  static readonly definition = {"description": "Local inventory\nStores hosts locally\n", "args": {"path": {"description": "Inventory file path", "type": "string", "match": ["filepath"], "default": "${it.settings.inventories.local.path}"}}, "maintainers": ["lowlighter"]}
}
export {LocalInventory as Inventory}

/** Input arguments */
export interface raw {
  /** Inventory file path */
  path?: string | null
}

/** Validated and transformed arguments */
export interface args {
  /** Inventory file path */
  path: string
}
