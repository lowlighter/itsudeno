//Imports
import type {outcome as _outcome} from "@core/executors"
import type {definition as _definition, input} from "@tools/validate"
import type {infered} from "@types"

/** Reporter definition */
export type definition = {
  /** Description */
  description: string,
  /** Arguments */
  args: _definition<input>,
  /** Maintainers */
  maintainers: string[],
}

/** Executor outcome */
export type outcome = _outcome<infered, infered>
