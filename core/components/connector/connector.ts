// Imports
import { minify } from "https://cdn.skypack.dev/terser@v5.10.0"
import type { shell } from "../../../core/tools/exec/types.ts"
import type { prompt } from "../../../core/tools/exec/types.ts"
import { ItsudenoError } from "../../meta/errors.ts"
import { Component } from "../component/component.ts"
import type { options, permissions, handle } from "./types.ts"
import {root} from "../../meta/root.ts"
import {encode} from "https://deno.land/std@0.127.0/encoding/base64.ts"

/** Generic connector */
export abstract class Connector extends Component {
	/** Command handler */
	protected abstract handle(handle:handle): Promise<Array<string|prompt>>

	/** Shell handler */
	protected abstract shell:shell

	/** Execute payload */
	async exec(payload: string, {escalation, permissions = {}, cwd, env}: options) {
		const commands = await this.handle({escalation, command:await this.#deno(payload, permissions)})
		return this.shell(commands, {tracer:this.context?.vars?.it?.tracer ?? null, cwd, env})
	}

	/** Create deno command */
	async #deno(payload: string, permissions: permissions) {
		const options = ["--no-check", "--no-remote", "--quiet", "--unstable"]
		const allow = []
		if (permissions.all)
			allow.push("--allow-all")
		else {
			for (const name of ["hrtime", "plugin"] as const) {
				if (permissions[name])
					allow.push(`--allow-${name}`)
			}
			for (const name of ["read", "write", "net", "run", "env", "ffi"] as const) {
				if (Array.isArray(permissions[name]))
					allow.push(`--allow-${name}=${(permissions[name] as string[]).join(",")}`)
				else if (permissions[name])
					allow.push(`--allow-${name}`)
			}
		}
		return ["deno run", ...options, ...allow, `"${await this.#bundle(payload)}"`].join(" ").trim()
	}

	/** Bundle payload into data url */
	async #bundle(payload: string) {
		try {
			this.tracer?.vvv(`preparing payload: ${payload}`)
			const {files} = await Deno.emit(`data:application/javascript;base64,${encode(payload)}`, {
				bundle: "classic", 
				check: false,
				importMapPath:"imports.json",
				importMap:{
					imports:{
						"@it/":`${root.path}/`,
					},
				}
			})
			for (const [file, content] of Object.entries(files)) {
				if (file.endsWith(".map"))
					continue
				const {code} = await minify(content)
				return `data:application/javascript;base64,${encode(code)}`
			}
			throw new ItsudenoError.Connector("unexpected error")
		}
		catch (error) {
			throw new ItsudenoError.Connector(`failed to prepare payload: ${error}`)
		}
	}
}
