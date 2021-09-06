//deno-lint-ignore-file ban-unused-ignore no-empty-interface
/*
 * THIS FILE IS AUTO-GENERATED, PLEASE DO NOT EDIT
 */

//Imports
import {Reporter} from "@core/reporters"

/** Console reporter */
export abstract class ConsoleReporter extends Reporter<raw, args> {
  /** Constructor */
  constructor(args?: raw) {
    super(ConsoleReporter, args)
  }

  /** Url */
  static readonly url = import.meta.url

  /** Definition */
  static readonly definition = {
    "description": "Console reporter\nOutputs module outcome through console\n",
    "args": {
      "report": {
        "description": "Report options",
        "type": {
          "changes": {"description": "Report changes", "type": "boolean", "default": true},
          "result": {"description": "Report results", "type": "boolean", "default": true},
          "skipped": {"description": "Report skipped executions", "type": "boolean", "default": true},
          "success": {"description": "Report successful executions", "type": "boolean", "default": true},
        },
      },
    },
    "maintainers": ["lowlighter"],
  }
}
export {ConsoleReporter as Reporter}

/** Input arguments */
export interface raw {
  /** Report options */
  report?: {
    /** Report changes */
    changes?: boolean | null,
    /** Report results */
    result?: boolean | null,
    /** Report skipped executions */
    skipped?: boolean | null,
    /** Report successful executions */
    success?: boolean | null,
  }
}

/** Validated and transformed arguments */
export interface args {
  /** Report options */
  report: {
    /** Report changes */
    changes: boolean,
    /** Report results */
    result: boolean,
    /** Report skipped executions */
    skipped: boolean,
    /** Report successful executions */
    success: boolean,
  }
}
