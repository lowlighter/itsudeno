// Imports
import type { prompt } from "../../../core/tools/exec/mod.ts"
import { Component } from "../component/component.ts"

/** Generic escalation */
export abstract class Escalation extends Component {
	/** Command handler */
	abstract handle(command: string): Promise<Array<string | prompt>>
}
