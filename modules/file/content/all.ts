//Imports
import {Module} from "@generated/modules/file/content/it.ts"
import type {before, initialized} from "@generated/modules/file/content/it.ts"
import {hash} from "@tools/hash"
import {readAll, writeAll} from "std/io/util.ts"
import {isAbsolute, join} from "std/path/mod.ts"
import type {uninitialized} from "@types"

/** Generic implementation */
Module.register(
  import.meta.url,
  class extends Module {
    /** File handle */
    protected file = null as uninitialized as Deno.File

    /** Text encoder */
    protected readonly encoder = new TextEncoder()

    /** Text decoder */
    protected readonly decoder = new TextDecoder()

    /** Collect past state */
    async past({args}: initialized) {
      //Resolve path
      let {path} = args
      if (!isAbsolute(path))
        path = join(Deno.cwd(), path)
      args.path = path

      //Read file content
      try {
        const file = await Deno.open(path, {read: true})
        return {
          content: this.decoder.decode(await readAll(file)),
          md5: await hash.md5(path, {mode: "file"}),
        }
      }
      catch {
        //Ignore errors
      }
      return {md5: null, content: null}
    }

    /** Check configuration changes */
    async check({args: {content}}: before) {
      return {content, md5: await hash.md5(content)}
    }

    /** Apply configuration changes */
    async apply(result: before) {
      //Extract arguments
      const {args: {path, content}, past} = result

      //Set file content
      this.file = await Deno.open(path, {write: true, create: true})
      await writeAll(this.file, this.encoder.encode(content))
      Deno.close(this.file.rid)

      //Change check
      this.file = await Deno.open(path, {read: true})
      const md5 = await hash.md5(path, {mode: "file"})
      if (past.md5 !== md5)
        result.changed = true
      return {content, md5}
    }

    /** Cleanup */
    //deno-lint-ignore require-await
    protected async cleanup() {
      Deno.close(this.file.rid)
    }
  },
)
