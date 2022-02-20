// Imports
import { assert, assertRejects, assertStrictEquals, assertObjectMatch, ItsudenoError, Suite, TestTracer } from "../../testing/mod.ts"
import type { test } from "../../testing/mod.ts"
import { exec } from "./exec.ts"
import { sh } from "./bin/sh.ts"
import { pwsh } from "./bin/pwsh.ts"

// Tests
await new Suite(import.meta.url)
	.group("exec", test => {
		for (const [i, stdio] of Object.entries({1: "stdout", 2: "stderr"} as const)) {
			test(`(>&${stdio})`, async () => {
				const {success, code, ...stdo} = await exec(`bash -c 'echo itsudeno >&${i}'`)
				assert(success)
				assertStrictEquals(code, 0)
				assertStrictEquals(stdo[stdio], "itsudeno\n")
				assertStrictEquals(stdo[({stdout: "stderr", stderr: "stdout"} as const)[stdio]], "")
			})
		}

		test("(<&1)", async () => {
			const {success, code, stdout, stderr} = await exec(`bash -c 'read it && echo $it'`, {prompts: [{stdin: "itsudeno"}]})
			assert(success)
			assertStrictEquals(code, 0)
			assertStrictEquals(stdout, "itsudeno\n")
			assertStrictEquals(stderr, "")
		})

		test("(<&1) (no linefeed)", async () => {
			const tracer = await new TestTracer().ready
			const {success} = await exec(`bash -c 'read it && echo $it'`, {tracer, prompts: [{stdin: "itsudeno", lf:(0 as test)}]})
			assert(!success)
			assert(tracer.handled.has("stdin input does not end with a linefeed, if this is intentional explicitely set lf option to false"))
		})

		test("(not-found)", async () => {
			assertRejects(() => exec("itsudeno-not-found"), ItsudenoError.Unsupported, "could not find executable")
		})

		test("(unexpected-error)", async () => {
			const tracer = Object.assign(await new TestTracer().ready, {handle() { throw new Error("test error") }})
			assertRejects(() => exec("bash -c 'echo itsudeno'", {tracer}), ItsudenoError, "test error")
		})

	})
	.group("sh", test => {

		test("()", async () => {
			const tracer = await new TestTracer().ready
			const {success, code, commands} = await sh([
				"echo itsudeno >&1",
				"echo itsudeno >&2",
				"echo itsudeno >&1",
				"echo itsudeno >&2",
			], {tracer})
			assert(success)
			assertStrictEquals(code, 0)
			assertStrictEquals(commands.length, 4)
			assertObjectMatch(commands[0], {stdout:"itsudeno\n", stderr:""})
			assertObjectMatch(commands[1], {stdout:"", stderr:"itsudeno\n"})
			assertObjectMatch(commands[2], {stdout:"itsudeno\n", stderr:""})
			assertObjectMatch(commands[3], {stdout:"", stderr:"itsudeno\n"})
			assert(tracer.handled.size > 0)
		})

	})
	.group("pwsh", test => {

		test("()", async () => {
			const tracer = await new TestTracer().ready
			const {success, code, commands} = await pwsh([
				"Write-Output itsudeno",
				"Write-Error itsudeno",
				"Write-Output itsudeno",
				"Write-Error itsudeno",
			], {tracer})	
			assert(success)
			assertStrictEquals(code, 0)
			assertStrictEquals(commands.length, 4)
			assertObjectMatch(commands[0], {stdout:"itsudeno\n", stderr:""})
			assertObjectMatch(commands[1], {stdout:"", stderr:"Write-Error: itsudeno\n"})
			assertObjectMatch(commands[2], {stdout:"itsudeno\n", stderr:""})
			assertObjectMatch(commands[3], {stdout:"", stderr:"Write-Error: itsudeno\n"})
			assert(tracer.handled.size > 0)
		})

	})
	.conclude()
