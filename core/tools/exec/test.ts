// Imports
import { assert, assertRejects, assertStrictEquals, ItsudenoError, Suite, TestTracer } from "../../testing/mod.ts"
import { command } from "./command.ts"

// Tests
await new Suite(import.meta.url).group("command", test => {
	for (const [i, stdio] of Object.entries({1: "stdout", 2: "stderr"} as const)) {
		test(`(>&${stdio})`, async () => {
			const {success, code, ...stdo} = await command(`bash -c 'echo itsudeno >&${i}'`)
			assert(success)
			assertStrictEquals(code, 0)
			assertStrictEquals(stdo[stdio], "itsudeno")
			assertStrictEquals(stdo[({stdout: "stderr", stderr: "stdout"} as const)[stdio]], "")
		})
	}

	test("(<&1)", async () => {
		const {success, code, stdout, stderr} = await command(`bash -c 'read it && echo $it'`, {prompts: [{stdin: "itsudeno\n"}]})
		assert(success)
		assertStrictEquals(code, 0)
		assertStrictEquals(stdout, "itsudeno")
		assertStrictEquals(stderr, "")
	})

	test("(<&1) (no linefeed)", async () => {
		const tracer = await new TestTracer().ready
		const {success} = await command(`bash -c 'read it && echo $it'`, {tracer, prompts: [{stdin: "itsudeno"}]})
		assert(!success)
		assert(tracer.handled.has("stdin does not end with a linefeed"))
	})

	test("(not-found)", async () => {
		assertRejects(() => command("itsudeno-not-found"), ItsudenoError.Unsupported, "could not find executable")
	})
}).conclude()
