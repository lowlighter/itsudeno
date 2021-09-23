//Imports
import {os} from "@core/setup/os"
import {Logger} from "@tools/log"
import argv from "y/string-argv@0.3.1"
import {ItsudenoError} from "@errors"
const log = new Logger(import.meta.url)

//Text encoder and decoder
const decoder = new TextDecoder()
const encoder = new TextEncoder()

/** Run a raw command on system */
const run = Object.assign(async function run(command: string, {stdin = null, cwd, env}: {stdin?: string | null, cwd?: string, env?: {[key: string]: string}} = {}) {
  let process
  try {
    log.vvv(`command: ${command}`)
    process = Deno.run({cmd: argv(command), cwd, env, stdin: stdin ? "piped" : "null", stdout: "piped", stderr: "piped"})
    if ((stdin) && (process.stdin)) {
      const bytes = [...encoder.encode(stdin)].map(byte => new Uint8Array([byte]))
      for (const byte of bytes) {
        await log.byte(byte)
        await process.stdin.write(byte)
      }
    }
    process?.stdin?.close()
    const [{success, code}, stdout, stderr] = await Promise.all([process.status(), process.output(), process.stderrOutput()])
    return {success, code, stdout: decoder.decode(stdout), stderr: decoder.decode(stderr)}
  }
  catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      const [cmd] = argv(command)
      throw new ItsudenoError.Run(`could not find executable: "${cmd}" `)
    }
    throw new ItsudenoError.Internal(`run error: ${error}`)
  }
  finally {
    process?.close()
  }
}, {
  async powershell(command: string, options: {stdin?: string | null, cwd?: string, env?: {[key: string]: string}} = {}) {
    command = `powershell.exe -Nologo -NoProfile -NonInteractive -ExecutionPolicy Unrestricted -Command '${command.replace(/'/g, "''")}'`
    return await run(command, options)
  },
  async can(command: string) {
    return (await run(os === "windows" ? `where.exe ${command}` : `which ${command}`)).success
  },
})

//Exports
export {run}
