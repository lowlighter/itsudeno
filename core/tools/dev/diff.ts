// Imports
import { bgGreen, bgRed, bold, green, red, white } from "https://deno.land/std@0.126.0/fmt/colors.ts"
import { diffstr, DiffType as Diff } from "https://deno.land/std@0.126.0/testing/_diff.ts"

/** String diff */
export function diff(a: string, b: string): string {
	const messages = [] as string[]
	a = a.replaceAll("\t", "  ")
	b = b.replaceAll("\t", "  ")
	diffstr(a, b).forEach(({type, value, details}) => {
		const line = (details?.map(({type, value}) => {
			if (type === Diff.common)
				return value
			return color(type, {background: true})(value)
		}).join("") ?? value).replace(/^(.*)\\n(.*)$/gm, "$1$2")
		if (line.trim().length)
			messages.push(color(type)(line))
	})
	return messages.join("")
}

/** Diff color */
function color(type: Diff, {background = false} = {}) {
	switch (type) {
		case Diff.added:
			return (s: string) => background ? bgGreen(white(s)) : green(bold(s))
		case Diff.removed:
			return (s: string) => background ? bgRed(white(s)) : red(bold(s))
		default:
			return () => ""
	}
}
