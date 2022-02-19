// Imports
import { expandGlob } from "https://deno.land/std@0.123.0/fs/mod.ts"
import { join } from "https://deno.land/std@0.123.0/path/mod.ts"
import { root } from "../../meta/root.ts"

/** Search files with glob pattern */
export function glob(path: string, {base = "/", dirs = false, exclude = [] as string[]} = {}) {
	return expandGlob(path, {root: join(root.path, base), exclude, includeDirs: dirs, extended: true, globstar: true, caseInsensitive: true})
}
