//Imports
import {Component} from "../component/component.ts"
import {minify} from "https://cdn.skypack.dev/terser@v5.10.0"
import type {permissions, options, result} from "./types.ts"
import {ItsudenoError} from "../../meta/errors.ts"
import {command} from "../../../core/tools/exec/command.ts"

/** Generic connector */
export abstract class Connector extends Component {

  /** Command handler */
  abstract handle(command:string):Promise<result>

  /** Execute payload */
  async exec(payload:string, {escalation, permissions = {}}:options) {
    const {command:cmd, stdin} = await escalation.handle(await this.#deno(payload, permissions))
    return command(cmd, {stdin})
  }

    /** Create deno command */
    async #deno(payload:string, permissions:permissions) {
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

      return [
        "deno run", 
        ...options, 
        ...allow, 
        `"${await this.#bundle(payload)}"`
      ].join(" ").trim()
    }

    /** Bundle payload into data url */
    async #bundle(payload:string) {
        this.tracer?.vvv(`preparing payload: ${payload}`)
        await Deno.writeTextFile(`/tmp/bundle.ts`, payload)
        const { files } = await Deno.emit("/tmp/bundle.ts", {bundle:"classic", check:false});
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
