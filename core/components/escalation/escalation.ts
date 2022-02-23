// Imports
import { Component } from "../component/component.ts"
import type { prompt } from "../../../core/tools/exec/types.ts"

/** Generic escalation */
export abstract class Escalation extends Component {
	/** Command handler */
	abstract handle(command: string): Promise<Array<string|prompt>>
}
