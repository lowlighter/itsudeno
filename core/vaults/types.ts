//Imports
import type {definition as _definition, input} from "@tools/validate"

/** Vault definition */
export type definition = {
  /** Description */
  description: string,
  /** Arguments */
  args: _definition<input>,
  /** Maintainers */
  maintainers: string[],
}
