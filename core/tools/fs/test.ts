// Imports
import { assert, Suite } from "../../testing/mod.ts"
import { glob } from "./mod.ts"

// Tests
await new Suite(import.meta.url).group("glob", test => {
	test("()", async () => {
		const files = new Set()
		for await (const {name} of glob("**/fs/*.ts"))
			files.add(name)
		assert(files.size > 0)
		assert(files.has("glob.ts"))
		assert(files.has("mod.ts"))
		assert(files.has("test.ts"))
	})
}).conclude()
