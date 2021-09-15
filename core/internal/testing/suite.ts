//Imports
import {esm} from "@tools/internal"
import {Logger} from "@tools/log"
import {run} from "@tools/run"
import {deferred} from "@tools/std"
import {delay} from "std/async/delay.ts"
import {italic, yellow} from "std/fmt/colors.ts"
import {assertObjectMatch} from "std/testing/asserts.ts"
import type {infered} from "@types"
const log = new Logger(import.meta.url)

/**
 * Test suite
 *
 * An helper to create unit tests
 */
export class Suite {
  /** Constructor */
  constructor(url: string, section?: string) {
    this.prefix = esm(url)
    this.section = section
  }

  /** Prefix */
  readonly prefix

  /** Section */
  readonly section

  /** Pending promises */
  readonly #pending = [] as Array<void | Promise<void>>

  /** Format test name */
  #format(name: string, {missing = false, details = ""} = {}) {
    const text = `[${this.prefix}${this.section ? `.${this.section}` : ""}] ${name}${details ? italic(` (${details})`) : ""}${missing ? italic(" {missing tests}") : ""}`
    return missing ? yellow(text) : text
  }

  /** Test */
  test(name: string, fn: test, {missing = false, details = "", ...options}: options = {}) {
    Deno.test({name: this.#format(name, {missing, details}), fn, ...options})
    return this
  }

  /** Missing test */
  missing(name: string) {
    this.test(name, () => {}, {missing: true, ignore: true})
    return this
  }

  /** Test group */
  group(name: string, tests: (test: (name: string, fn: test, options?: options) => void) => (void | Promise<void>)) {
    this.#pending.push(tests((details: string, fn: test, options?: options) => this.test(name, fn, {details, ...options})))
    return this
  }

  /** Conclude tests */
  async conclude() {
    await Promise.all(this.#pending)
    log.info(`test suite concluded`)
  }

  /** Testing containers */
  static readonly containers = {
    /** Used ports */
    ports: new Set<number>(),
  }

  /** Test suite for modules */
  static readonly Modules = class extends Suite {
    /** Cleanup promises */
    readonly #cleanup = [] as Array<() => void>

    /** Module name */
    get #module() {
      return this.prefix.replace("modules.", "")
    }

    /** Bench a function or module agains all available containers */
    bench(callback: (test: (name: string, fn: test, options?: options) => (void | Promise<void>), module: (args: infered) => infered) => void) {
      const promise = deferred<void>()
      this.#pending.push(promise)
      void (async () => {
        //Instantiate a docker images
        const groups = []
        images:
        for (const name of (await import("@testing/containers")).images) {
          while (true) {
            for (let port = 4650; port < 65535; port++) {
              if (Suite.containers.ports.has(port))
                continue
              Suite.containers.ports.add(port)
              const {stdout: id, stderr} = await run(`docker run --name itsudeno_test_${port} --detach --tty --publish ${port}:22 ${name}`)
              if (stderr)
                log.warn(stderr)
              log.vvv(`started container ${name} (${id})`)

              //Run callback and add cleanup
              const promise = deferred<void>()
              groups.push(promise)
              this.group(name, test => {
                callback(test, async (args: infered) => {
                  const outcome = await ((await import("@executors")).Executors.ssh.call({name: this.#module, args, target: "test"}, {host: "127.0.0.1", port, login: "it", password: "itsudeno"}))
                  if (outcome.failed)
                    log.error(Deno.inspect(outcome))
                  return outcome.result.module ?? {}
                })
                promise.resolve()
                this.#cleanup.push(async () => {
                  await run(`docker rm --force ${id}`)
                  Suite.containers.ports.delete(port)
                  log.vvv(`removed container ${name} (${id})`)
                })
              })
              continue images
            }
            log.vvv(`could not start container ${name} as all ports were taken, retrying later`)
            await delay(15 * 1000)
          }
        }
        await Promise.all(groups)
        promise.resolve()
      })()
      return this
    }

    /** Idempotency check */
    idempotent(outcome: infered, options: options = {}) {
      return this.bench((test, module) => {
        test("idempotency test (1st call)", async () => assertObjectMatch(await module(outcome.args), outcome), options)
        test("idempotency test (2nd call)", async () => assertObjectMatch(await module(outcome.args), {...outcome, past: {...outcome.result}, changed: false}), options)
      })
    }

    /** Conclude tests */
    async conclude() {
      await super.conclude()
      this.test("cleaning", async () => void await Promise.all(this.#cleanup.map(cleanup => cleanup())))
    }
  }
}

/** Test function */
type test = () => (void | Promise<void>)

/** Test options */
type options = {details?: string, missing?: boolean, ignore?: boolean, only?: boolean, sanitizeExit?: boolean, sanitizeResources?: boolean}
