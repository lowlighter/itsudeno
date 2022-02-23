//Imports
import ejs from 'https://cdn.skypack.dev/ejs';
import {ItsudenoError} from "../../meta/errors.ts"
import type {options, vars} from "./types.ts"

/** Templating (EJS-based) */
export function template(content:string, vars?:vars, options?:options):Promise<string>
export function template(content:string, vars?:vars, options?:options & {sync:true}):string
export function template(content:string, vars = null as vars, {tracer = null, safe = false, sync = false, inline = false} = {} as options) {
  tracer?.vvvv(`template: ${Deno.inspect(content)}`)
  if (inline) {
    content = `<%= \`${content.replaceAll("<%", "${'<'+'%'}").replaceAll("%>", "${'%'+'>'}")}\` %>`
    tracer?.vvvv(`template: inline mode set content to ${Deno.inspect(content)}`)
  }
  try {
    return ejs.render(content, vars ?? {}, {
      async:!sync,
      includer(path:string) {
        return {template:Deno.readTextFileSync(path)}
      },
      escape(x:unknown) { 
        return x
      }
    })
  }
  catch (error) {
    if (safe) {
      tracer?.vvvv(`template: safe mode triggered, returning content as it`)
      return content
    }
    throw new ItsudenoError.Template(`template error: ${error}`)
  }
}
