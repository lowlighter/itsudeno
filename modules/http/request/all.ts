//Imports
import {Module} from "@generated/modules/http/request/it.ts"
import type {before, result} from "@generated/modules/http/request/it.ts"
import {Logger} from "@tools/log"
import type {loose, uninitialized} from "@types"
const log = new Logger(import.meta.url)

/** Generic implementation */
Module.register(
  import.meta.url,
  class extends Module {
    /** Controller */
    controller = null as uninitialized as AbortController

    /** Check configuration changes */
    async check(result: before) {
      return await this.apply(result)
    }

    /** Apply configuration changes */
    async apply({args: {url, method, body, headers, cache, redirects, status}}: before) {
      //Prepare options
      this.controller = new AbortController()
      const options = {
        method,
        body: JSON.stringify(body),
        headers: new Headers(Object.entries(headers) as Array<[string, string]>),
        cache: ["no-cache", "force-cache"][+cache] as RequestCache,
        redirect: ["manual", "follow"][+redirects] as RequestRedirect,
        signal: this.controller.signal,
      }

      //Remove body from GET and HEAD requests
      if (["GET", "HEAD"].includes(method))
        delete (options as loose).body

      //Perform http request
      const result = {url, redirected: false, status: {code: NaN, text: ""}, text: "", data: null} as result
      const response = await fetch(url, options).catch(response => response)
      result.url = response.url
      result.redirected = response.redirected
      result.status.code = response.status
      result.status.text = response.statusText
      result.text = await response.text().catch(() => "")
      result.data = await response.json().catch(() => null)
      log.vvv(response)

      //Status code check
      if (!status.includes(result.status.code))
        throw new Error(`Expected status code to be one of ${JSON.stringify(status)}, got ${result.status.code}`)

      return result
    }

    /** Cleanup */
    //deno-lint-ignore require-await
    protected async cleanup() {
      this.controller.abort()
    }
  },
)
