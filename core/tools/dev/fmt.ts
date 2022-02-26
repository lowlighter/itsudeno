// Imports
import { parse } from "https://deno.land/std@0.126.0/flags/mod.ts"
import { createStreaming as stream } from "https://deno.land/x/dprint@0.2.0/mod.ts"
import { glob } from "./../fs/mod.ts"
import { diff } from "./diff.ts"

// Flags
const flags = parse(Deno.args)

// Global configuration
const config = {useTabs: true, lineWidth: 180}

// Formatters
const fmt = {
	ts: await stream(fetch("https://plugins.dprint.dev/typescript-0.64.0.wasm")),
	json: await stream(fetch("https://plugins.dprint.dev/json-0.14.1.wasm")),
	md: await stream(fetch("https://plugins.dprint.dev/markdown-0.12.2.wasm")),
	dockerfile: await stream(fetch("https://plugins.dprint.dev/dockerfile-0.2.2.wasm")),
}

// TypeScript formatter
fmt.ts.setConfig(config, {
	semiColons: "asi",
	quoteStyle: "preferDouble",
	quoteProps: "asNeeded",
	useBraces: "preferNone",
	singleBodyPosition: "nextLine",
	preferSingleLine: true,
	"arrowFunction.useParentheses": false,
	"typeLiteral.separatorKind": "comma",
	spaceSurroundingProperties: false,
})

// JSON formatter
fmt.json.setConfig(config, {})

// Markdown formatter
fmt.md.setConfig(config, {emphasisKind: "asterisks", strongKind: "asterisks"})

// Dockerfile formatter
fmt.dockerfile.setConfig(config, {})

// Apply formatting
if (import.meta.main) {
	let files = 0
	let ok = true
	const exclude = (await Deno.readTextFile(".gitignore")).split("\n")
	for (const ext of Object.keys(fmt) as Array<keyof typeof fmt>) {
		for await (const {path, isFile} of glob(`**/*.${ext}`, {exclude})) {
			if (!isFile)
				continue
			files++
			const content = await Deno.readTextFile(path)
			const formatted = fmt[ext].formatText(path, content)
			if (content !== formatted) {
				console.log(path)
				if (flags.check) {
					console.log(diff(content, formatted))
					ok = false
				} else {
					await Deno.writeTextFile(path, formatted)
				}
			}
		}
	}
	console.log(`Checked ${files} file${files === 1 ? "" : "s"}`)
	Deno.exit(ok ? 0 : 1)
}
