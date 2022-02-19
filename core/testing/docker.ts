import ConsoleTracer from "builtin/tracer/console/mod.ts"
import { command } from "core/tools/exec/command.ts"

const tracer = await new ConsoleTracer("docker").ready

export class Docker {
	async spawn() {
		await command("whoami", {tracer})
	}
}

const a = new Docker()
console.log(await a.spawn())

//  await exec(`docker build -t ${name} ${dirname(path)}`, {piped:false})
