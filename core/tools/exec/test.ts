//Imports
import {Suite, assert, assertStrictEquals} from "@testing"
import {command} from "core/tools/exec/command.ts"

//Tests
await new Suite(import.meta.url)
    .group("command", test => {
        for (const [i, stdio] of Object.entries({1:"stdout", 2:"stderr"}))
        test(`echo itsudeno to ${stdio}`, async () => {
            const {success, code, stdout, stderr} = await command(`bash -c "echo itsudeno >&${i}"`)
            assert(success)
            assertStrictEquals(code, 0)
            assertStrictEquals(stdout, "itsudeno")
            assertStrictEquals(stderr, "")
        })
    })
    .conclude()
