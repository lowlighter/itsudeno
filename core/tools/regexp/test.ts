// Imports
import { assertStrictEquals, Suite } from "../../testing/mod.ts"
import {escape} from "./mod.ts"

// Tests
await new Suite(import.meta.url)
	.group("escape", test => {

    test("('pattern')", () => {
      assertStrictEquals(escape("foo"), "foo")
      assertStrictEquals(escape("[foo]+?(?:bar)*"), "\\[foo\\]\\+\\?\\(\\?:bar\\)\\*")
    })

	})
	.conclude()
