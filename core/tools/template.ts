//deno-lint-ignore-file no-unused-vars
//(for some reason `safe` is detected as unused but this isn't the case)
//Imports
import {Logger} from "@tools/log"
import {renderToString} from "x/dejs@0.10.0/mod.ts"
import {ItsudenoError} from "@errors"
import type {loose} from "@types"
const log = new Logger(import.meta.url)

/** Template */
export function template(content: string, context: loose, options?: {mode?: mode, safe?: boolean, warn?: boolean, sync?: false}): Promise<string>
export function template(content: string, context: loose, options?: {mode?: mode, safe?: boolean, warn?: boolean, sync?: boolean}): Promise<string>
export function template(content: string, context: loose, options?: {mode?: mode, safe?: boolean, warn?: boolean, sync: true}): string
export function template(content: string, context: loose, {mode = "js" as mode, safe = false, warn = false, sync = false} = {}) {
  return sync ? templateSync(content, context, {mode, safe, warn}) : templateAsync(content, context, {mode, safe, warn})
}

/** Template (async) */
async function templateAsync(content: string, context: loose, {mode = "js" as mode, safe = false, warn = false} = {}) {
  try {
    switch (mode) {
      case "js":
        return await new Promise((solve, reject) =>
          new Function(
            ...Object.keys(context),
            "$$itsudeno$solve",
            "$$itsudeno$reject",
            `(async () => {
            try { $$itsudeno$solve(\`${content}\`) } catch (error) { $$itsudeno$reject(error) }
          })()`,
          )(...Object.values(context), solve, reject)
        ) as string
      case "ejs": {
        return await renderToString(content, context)
      }
      default:
        throw new ItsudenoError.Unsupported(`unsupported templating mode: ${mode}`)
    }
  }
  catch (error) {
    if (error instanceof ItsudenoError.Unsupported)
      throw error
    if (safe) {
      if (warn)
        log.warn(`failed to template: ${error}`)
      return content
    }
    throw new ItsudenoError.Template(`template error ${error}`)
  }
}

/** Template (sync) */
function templateSync(content: string, context: loose, {mode = "js" as mode, safe = false, warn = false} = {}) {
  try {
    switch (mode) {
      case "js":
        return new Function(...Object.keys(context), `return \`${content}\``)(...Object.values(context))
      default:
        throw new ItsudenoError.Unsupported(`unsupported templating mode: ${mode}`)
    }
  }
  catch (error) {
    if (error instanceof ItsudenoError.Unsupported)
      throw error
    if (safe) {
      if (warn)
        log.warn(`failed to template: ${error}`)
      return content
    }
    throw new ItsudenoError.Template(`template error ${error}`)
  }
}

/** Templating mode */
export type mode = "js" | "ejs"
