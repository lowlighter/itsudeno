//Imports
import type {definition as _definition, input} from "@tools/validate"
import type {infered} from "@types"

/** Module payload */
export interface payload {
  /** Module name */
  name: string
  /** Module arguments */
  args: infered
  /** Module target */
  target: string
}

/** Executor result */
export interface result {
  /** Exit code */
  code: number
  /** Module outcome */
  module: infered
  /** Standard output (stdout) */
  stdout: string
  /** Standard error (stderr)  */
  stderr: string
}

/** Executor definition */
export interface definition {
  /** Description */
  description: string
  /** Inherited definition */
  inherits?: string
  /** Arguments */
  args: _definition<input> | null
}

/** Executor metadata */
export interface meta {
  /** Executor name */
  executor: string
  /** Executor scope */
  scope: string
  /** Executor target */
  target: string
}

/** Executor before execution */
export interface before<raw, args> {
  /** Metadata */
  meta: meta
  /** Arguments */
  args: {raw: raw} & args
  /** Module */
  module: payload
}

/** Executor after execution */
export interface applied<raw, args> extends before<raw, args> {
  /** Resulting state */
  result: result
  /** Error details */
  error: string | null
}

/** Executor outcome */
export interface outcome<raw, args> extends applied<raw, args> {
  /** Whether execution failed */
  failed: boolean
  /** Whether execution succedded (alias for not failed) */
  success: boolean
  /** Completion date */
  completed: Date | null
}
