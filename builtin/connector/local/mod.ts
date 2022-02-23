// Imports
import { Connector } from "../../../core/components/connector/connector.ts"
import {is} from "../../../core/tools/is/type.ts"
import {settings} from "../../../core/settings/mod.ts"

/** Local connector */
export default class LocalConnector extends Connector {
	/** Constructor */
	constructor(id = "") {
		super(import.meta.url, id)
	}

	@definition({
		login:{
			type:"string"
		},
		ip:{
			type:"string"
		},
		port:{
			type:"number"
		}
	}) 
	x({login, ip, port, password}) {
		
		if (!is.null(password))

//env:{SSHPASS:"itsudeno"}

		return [
			{stdin:"set -e", capture:false},
			{stdin:`sshpass -e ssh -tt -o StrictHostKeyChecking=no -l ${login} -p ${port} ${ip} sh -i`, capture:false},
			{prompt:false, stdin:`PS1=${settings.tools.exec.ps1}`, capture:false},
			{prompt:false, on({tracer, prompts}) { 
				prompts.channel = "stdout" 
				prompts.feedback = {string:"$<stdin>\\r?\\n", channel:"stdout"}
				tracer?.vvvv(`exec: prompts channel changed to ${prompts.channel}`)
			}},
		]
	}

	/** Evaluate payload */
	async eval(code: string) {
		console.log(`${await x.up()} ${await this.exec(code)}`)
		return await command(`${await x.up()} ${await this.exec(code)}`)
	}
}




console.log(await sh([
	
	
	{stdin:"sudo -K", capture:false},
	{stdin:"sudo -S -k -p '__itsudeno_sudo_' deno --version", flush:true},
	{stdout:/(?:We trust you have received the usual lecture[\s\S]+)?(?<!')__itsudeno_sudo_(?!')/, stdin:"itsudeno", feedback:false, capture:false, amend:true},
	//{stdout:/\r?\n/, capture:false, amend:true}
], {tracer, env:{SSHPASS:"itsudeno"}}))