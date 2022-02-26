// Imports
import { ItsudenoError } from "../../../core/meta/errors.ts"
import { lcfirst } from "./lcfirst.ts"
import { lower } from "./lower.ts"
import { ucfirst } from "./ucfirst.ts"
import { upper } from "./upper.ts"

// Separators
const separators = {snake: "_", kebab: "-", dot: ".", slash: "/", http: "-", train: "-"}

// From case
type fcase =
	| keyof typeof separators
	| "pascal"
	| "camel"

// To case
type tcase =
	| fcase
	| "flat"
	| "macro"

/** Change string case */
export function strcase(string: string, {from, to}: {from: fcase, to: tcase}) {
	// Parse identifier
	const parts = []
	switch (true) {
		case ["http", "train"].includes(from):
			string = lower(string)
			// falls through
		case Object.keys(separators).includes(from):
			parts.push(...string.split(separators[from as keyof typeof separators]).filter(part => part))
			break
		case ["pascal", "camel"].includes(from):
			parts.push(...string.split(/(?=[A-Z])/g).filter(part => part).map(lcfirst))
			break
		default:
			throw new ItsudenoError.Unsupported(`unsupported string case conversion: ${from} → ${to}`)
	}

	// Rebuild identifier
	switch (true) {
		case Object.keys(separators).includes(to):
			return parts.map(({http: ucfirst, train: upper} as Record<string, typeof identity>)[to] ?? identity).join(separators[to as keyof typeof separators])
		case to === "pascal":
			return parts.map(ucfirst).join("")
		case to === "camel":
			return [...parts.slice(0, 1).map(lcfirst), ...parts.slice(1).map(ucfirst)].join("")
		case to === "flat":
			return parts.map(lower).join("")
		case to === "macro":
			return parts.map(upper).join("")
		default:
			throw new ItsudenoError.Unsupported(`unsupported string case conversion: ${from} → ${to}`)
	}
}

/** Identity function */
function identity(string: string) {
	return string
}
