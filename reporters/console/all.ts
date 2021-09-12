//Imports
import type {outcome} from "@core/reporters"
import {Reporter} from "@generated/reporters/console/it.ts"
import type {raw} from "@generated/reporters/console/it.ts"
import {is} from "@tools/is"
import {stringify} from "std/encoding/yaml.ts"
import {cyan, green, red, yellow} from "std/fmt/colors.ts"
import type {infered, loose} from "@types"

/** Generic implementation */
Reporter.register(
  import.meta.url,
  class extends Reporter {
    /** Report options */
    options = {changes: true, result: true, skipped: true, success: true}

    /** Perform async initialization */
    async async(raw: raw) {
      const {report: options} = await this.prevalidate(raw)
      this.options = options
      return super.async()
    }

    /** Print header */
    //deno-lint-ignore require-await
    async header({name}: {name: string}) {
      console.log(`##${name ? ` ${name} ` : "##"}${"#".repeat(Math.max(0, 80 - name.length))}`.trim())
    }

    /** Print module report */
    //deno-lint-ignore require-await
    async report(outcome: outcome) {
      switch (true) {
        //Executor failed
        case outcome.failed: {
          const output = {[outcome.module.name]: "", [outcome.meta.target]: {failed: outcome.error}} as loose
          console.log(red(stringify([output] as infered)))
          break
        }

        //Executor success

        case outcome.success: {
          //Respect reporting options
          const module = outcome.result.module
          if (((!this.options.skipped) && (module.skipped)) || ((!this.options.success) && (module.success)))
            return
          //Generate report
          let color
          const output = {[module.name]: "", [outcome.meta.target]: {}} as loose
          switch (true) {
            //Failed execution
            case module.failed: {
              color = red
              Object.assign(output[outcome.meta.target], {failed: module.error})
              break
            }
            //Skipped execution
            case module.skipped: {
              color = cyan
              Object.assign(output[outcome.meta.target], {skipped: ""})
              break
            }
            //Successful execution
            default: {
              color = green
              if (module.changed)
                color = yellow
              if ((this.options.changes) && (!is.object.empty(module.changes)))
                Object.assign(output[outcome.meta.target], {changes: module.changes})
              if (this.options.result)
                Object.assign(output[outcome.meta.target], {result: module.result})
              break
            }
          }
          console.log(color(stringify([output] as infered)))
          break
        }
      }
    }
  },
)
