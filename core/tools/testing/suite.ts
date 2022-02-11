//Imports
import {esm} from "core/tools/meta/esm.ts"
import type {test} from "core/tools/testing/types.ts"

/** Helper to create unit test suites */
export class Suite {
    /** Constructor */
    constructor(meta:string) {
        this.esm = esm(meta)
    }

    /** ES module path */
    readonly esm

    /** Test */
    test(name: string, fn: test) {
        Deno.test({name:`[${this.esm}] ${name}`, fn})
        return this
    }

    /** Pending groups */
    readonly #groups = [] as Array<void | Promise<void>>

    /** Test group */
    group(group: string, tests:(test:(name:string, fn:test) => this) => void|Promise<void>) {
        this.#groups.push(tests((name: string, fn: test) => this.test(`${group} | ${name}`, fn)))
        return this
    }

    /** Conclude test suite */
    async conclude() {
        await Promise.all(this.#groups)
    }
}
