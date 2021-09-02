//Imports
import {createHash} from "std/hash/mod.ts"
import {iter} from "std/io/util.ts"
import {toFileUrl} from "std/path/mod.ts"
import {ItsudenoError} from "@errors"
import type {infered} from "@types"

/** Hash a file */
const hash = Object.assign(async function hash(content: string, {algorithm, mode}: {algorithm: string, mode?: string}) {
  const hashed = createHash(algorithm as infered)
  switch (mode) {
    //String hash
    case "string": {
      hashed.update(content)
      break
    }
    //File hash
    case "file": {
      const file = await Deno.open(toFileUrl(content), {read: true})
      for await (const chunk of iter(file))
        hashed.update(chunk)
      Deno.close(file.rid)
      break
    }
    //
    default:
      throw new ItsudenoError.Unsupported(`unsupported mode: ${mode}`)
  }
  return hashed.toString()
}, {
  async md5(path: string, {mode = "string"} = {}) {
    return await hash(path, {algorithm: "md5", mode})
  },
})

//Export
export {hash}
