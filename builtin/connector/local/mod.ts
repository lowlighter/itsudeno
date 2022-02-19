// Imports
import { Connector } from "../../../core/components/connector/connector.ts"

/** Local connector */
export default class LocalConnector extends Connector {
	/** Constructor */
	constructor(id = "") {
		super(import.meta.url, id)
	}

	/** Evaluate payload */
	async eval(code: string) {
		console.log(`${await x.up()} ${await this.exec(code)}`)
		return await command(`${await x.up()} ${await this.exec(code)}`)
	}
}
