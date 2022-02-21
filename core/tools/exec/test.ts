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
			test(`('command').${stdio}`, async () => {
				const {success, code, ...stdo} = await exec(`bash -c 'echo itsudeno >&${i}'`)
				assert(success)
				assertStrictEquals(code, 0)
				assertStrictEquals(stdo[stdio], "itsudeno\n")
				assertStrictEquals(stdo[({stdout: "stderr", stderr: "stdout"} as const)[stdio]], "")
			})
		}

		test("('command').stdin", async () => {
			const {success, code, stdout, stderr} = await exec(`bash -c 'read it && echo $it'`, {prompts: {list:[{stdin: "itsudeno"}]}})
			assert(success)
			assertStrictEquals(code, 0)
			assertStrictEquals(stdout, "itsudeno\n")
			assertStrictEquals(stderr, "")
		})

		test("('command', {cwd})", async () => {
			const {success, code, stdout, stderr} =  await exec("pwd", {cwd:"/"})
			assert(success)
			assertStrictEquals(code, 0)
			assertStrictEquals(stdout, "/\n")
			assertStrictEquals(stderr, "")
		})

		test("('command', {env})", async () => {
			const {success, code, stdout, stderr} =  await exec("printenv ITSUDENO", {env:{ITSUDENO:"itsudeno"}})
			assert(success)
			assertStrictEquals(code, 0)
			assertStrictEquals(stdout, "itsudeno\n")
			assertStrictEquals(stderr, "")
		})

		for (const [ansi, expected] of [[false, "itsudeno\n"], [true, "\x1b[0;36mitsudeno\x1b[0m\n"]] as const) {
			test(`('command', {ansi: ${ansi}})`, async () => {
				const {success, code, stdout, stderr} =  await exec('echo -e "\\x1b[0;36mitsudeno\\x1b[0m"', {ansi})
				assert(success)
				assertStrictEquals(code, 0)
				assertStrictEquals(stdout, expected)
				assertStrictEquals(stderr, "")
			})
		}		

		for (const [piped, expected] of [[false, ""], [true, "itsudeno\n"]] as const) {
		test(`('command', {piped: ${piped}})`, async () => {
			const {success, code, stdout, stderr} =  await exec("echo itsudeno", {piped})
			assert(success)
			assertStrictEquals(code, 0)
			assertStrictEquals(stdout, expected)
			assertStrictEquals(stderr, "")
		})
	}

		test("('command', {prompts, piped: false}) throws ItsudenoError.Range", async () => {
			assertRejects(() => exec("whoami", {prompts:{list:[{stdin:"#"}]}, piped:false}), ItsudenoError.Range, "requires stdio to be piped")
		})

		test("('<unknown>') throws ItsudenoError.Unsupported", async () => {
			assertRejects(() => exec("itsudeno-not-found"), ItsudenoError.Unsupported, "could not find executable")
		})

		test("(?) throws ItsudenoError", async () => {
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
