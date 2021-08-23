//Imports
import type {payload as _payload} from "@core/executors"
import type {definition as _definition, input} from "@tools/validate"
import type {loose} from "@types"

/** Inventory definition */
export type definition = {
  /** Description */
  description: string,
  /** Arguments */
  args: _definition<input>,
  /** Maintainers */
  maintainers: string[],
}

/** Host definition */
export type host = {
  /** Groups */
  groups?: string[],
  /** Data */
  data?: loose,
  /** Executors arguments */
  executors?: loose,
}
