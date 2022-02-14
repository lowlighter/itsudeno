//Imports
import type {options} from "core/tools/exec/types.ts"
import { ItsudenoError } from "@errors"
import argv from "y/string-argv@0.3.1"

//Text encoder and decoder
const decoder = new TextDecoder()
const encoder = new TextEncoder()

/** Command executor */
export async function command(command: string, {tracer = null, stdin = null, piped = true, cwd, env}: options = {}) {
  let process
  try {
    //Run child process
    tracer?.vvvv(`exec: ${command}`)
    console.log(argv(command))
    process = Deno.run({cmd: argv(command), cwd, env, stdin: stdin ? "piped" : "null", stdout: piped ? "piped" : "null", stderr: piped ? "piped" : "null"})

    //Write stdin (if defined)
    if ((stdin) && (process.stdin)) {
      const bytes = [...encoder.encode(stdin)].map(byte => new Uint8Array([byte]))
      for (const byte of bytes)
        await process.stdin.write(byte)
      tracer?.vvvv(`exec stdin: ${stdin}`)
      process.stdin?.close()
    }

    //Extract result
    const [{success, code}, stdout, stderr] = await Promise.all([process.status(), piped ? process.output() : null, piped ? process.stderrOutput() : null])
    return {success, code, stdout: stdout ? decoder.decode(stdout).replace(/\r?\n$/, "") : "", stderr: stderr ? decoder.decode(stderr).replace(/\r?\n$/, "") : ""}
  }
  catch (error) {
    if (error instanceof Deno.errors.NotFound)
      throw new ItsudenoError.Unsupported(`could not find executable: "${argv(command).shift()!}" `)
    throw new ItsudenoError(error)
  }
  finally {
    process?.close()
  }
}
