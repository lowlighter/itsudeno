// Imports
import { Escalation } from "../../../core/components/escalation/escalation.ts"
import { command } from "../../../core/tools/exec/command.ts"

/** Local connector */
export default class SudoEscalation extends Escalation {
	/** Constructor */
	constructor(id = "") {
		super(import.meta.url, id)
	}

	async handle(command: string) {
		// password
		// -u user -p itsudeno_passw
		return {command: `sudo -k -S -u test ${command}`}
	}
}
