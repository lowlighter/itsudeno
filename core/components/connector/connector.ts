// Imports
import { minify } from "https://cdn.skypack.dev/terser@v5.10.0"
import type { shell } from "../../../core/tools/exec/types.ts"
import type { prompt } from "../../../core/tools/exec/types.ts"
import { ItsudenoError } from "../../meta/errors.ts"
import { Component } from "../component/component.ts"
import type { options, permissions } from "./types.ts"

/** Generic connector */
export abstract class Connector extends Component {
	/** Command handler */
	abstract handle(): Promise<Array<string|prompt>>

	/** Shell handler */
	abstract shell:shell

	/** Execute payload */
	async exec(payload: string, {escalation, permissions = {}}: options) {

		await this.handle({escalation, x:await this.#deno(payload, permissions)})

		return this.shell()

		const {command: cmd, stdin} = await escalation.handle(await this.#deno(payload, permissions))
		return command(cmd, {stdin})
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
		this.tracer?.vvv(`preparing payload: ${payload}`)
		//https://github.com/denoland/deno/pull/13667 (direcetly use data url once supported)
		await Deno.writeTextFile(`/tmp/bundle.ts`, payload)
		const {files} = await Deno.emit("/tmp/bundle.ts", {bundle: "classic", check: false})
		for (const [file, content] of Object.entries(files)) {
			if (file.endsWith(".map"))
				continue
			const {code} = await minify(content)
			await Deno.remove("/tmp/bundle.ts")
			return `data:application/javascript;base64,${btoa(code)}`
		}
		throw new ItsudenoError.Connector("failed to prepare payload")
	}
}
