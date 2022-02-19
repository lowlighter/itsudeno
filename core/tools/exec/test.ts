// Imports
import { assert, assertRejects, assertStrictEquals, ItsudenoError, Suite, TestTracer } from "../../testing/mod.ts"
import type { test } from "../../testing/mod.ts"
import { exec } from "./exec.ts"

// Tests
await new Suite(import.meta.url).group("exec", test => {
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

}).conclude()

/*
const {stderr, stdio} = await exec(`sh -i`, {
		tracer,
		prompts: [
			{stdin: "PS1=itsudeno_prompt", capture: false, flush: true},
			{stderr: /itsudeno_prompt/, stdin: "echo hello >&1"},
			{stderr: /itsudeno_prompt/, stdin: "echo hello >&2"},
			{stderr: /itsudeno_prompt/, stdin: "echo hello >&1"},
			{stderr: /itsudeno_prompt/, stdin: "echo hello >&2"},
			{stderr: /itsudeno_prompt/, capture: false, close:true},
		],
	})
*/