//Imports
import {esm} from "@tools/internal"
import {italic, yellow} from "std/fmt/colors.ts"

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
    return await Promise.all(this.#pending)
  }
}

/** Test function */
type test = () => (void | Promise<void>)

/** Test options */
type options = {details?: string, missing?: boolean, ignore?: boolean, only?: boolean, sanitizeExit?: boolean}
