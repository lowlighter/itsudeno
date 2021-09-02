//Imports
import type {definition as _definition, input, output} from "@tools/validate"

/** Module definition */
export interface definition {
  /** Description */
  description: string
  /** Inherited definition */
  inherits?: string
  /** Whether execution is forced on controller */
  controller?: boolean
  /** Arguments */
  args: _definition<input> | null
  /** Past state */
  past: _definition<output> | null
  /** Resulting state */
  result: _definition<output> | null
}

/** Execution mode */
export type mode = "apply" | "check"

/** Result diff */
export type diff = {[key: string]: diff | {past?: unknown, current: unknown}}

/** Module call */
export interface mcall<raw, args, past, result> {
  /** Name */
  _?: string
  /** Changed state override */
  _changed?: (status: applied<raw, args, past, result>) => Promise<boolean> | boolean
  /** Failed state override */
  _failed?: (status: applied<raw, args, past, result>) => Promise<boolean> | boolean
  /** Skipped state override */
  _skipped?: (status: before<raw, args, past>) => Promise<boolean> | boolean
  /** Execution mode */
  _mode?: mode
  /** Reporter */
  _report?: string
  /** Vault */
  _vault?: string
  /** Inventory */
  _inventory?: string
  /** Target hosts */
  _targets?: string
  /** Executor */
  _using?: string
  /** Executor user */
  _as?: string
}

/** Module metadata */
export interface meta {
  /** Module name */
  module: string
  /** Execution mode */
  mode: mode
}

/** Module target initializated (before execution) */
export interface initialized<raw, args> {
  /** Metadata */
  meta: meta
  /** Input arguments */
  args: {raw: raw} & args
}

/** Module target status (after probing) */
export interface before<raw, args, past> extends initialized<raw, args> {
  /** State before execution */
  past: past
  /** Whether changes were reported */
  changed: boolean
}

/** Module target status (after execution) */
export interface applied<raw, args, past, result> extends before<raw, args, past> {
  /** Changes list */
  changes: diff
  /** State after execution */
  result: result
  /** Error details */
  error: string | null
}

/** Module outcome */
export interface outcome<raw, args, past, result> extends applied<raw, args, past, result> {
  /** Name */
  name: string
  /** Whether changes were applied */
  applied: boolean
  /** Whether execution was skipped */
  skipped: boolean
  /** Whether execution failed */
  failed: boolean
  /** Whether execution succedded (alias for !failed) */
  success: boolean
  /** Completion date */
  completed: Date | null
}
