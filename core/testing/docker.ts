import ConsoleTracer from "../../builtin/tracer/console/mod.ts"
import { exec } from "../tools/exec/exec.ts"
import { strcase } from "../../builtin/op/strings/strcase.ts"
import {root} from "../meta/root.ts"
import { join } from "https://deno.land/std@0.123.0/path/mod.ts"
import {ItsudenoError} from "../meta/errors.ts"

const tracer = await new ConsoleTracer("docker").ready

export class Docker {
	async spawn(image:string) {
		const dockerfile = join(root.path, "core/testing/containers", strcase(image, {from:"kebab", to:"slash"}), "container.dockerfile")

		const {success:build, stdout:sha256} = await exec(`docker build --quiet --tag ${image} --file ${dockerfile} .`, {tracer})
		if (!build)
			throw new ItsudenoError(`failed to build ${image}`)
		tracer?.debug(`built: ${image} (${sha256})`)

		const {success:run, stdout:id} = await exec(`docker run --detach --rm ${image}`, {tracer})
		if (!run)
			throw new ItsudenoError(`failed to start ${image}`)
		tracer?.debug(`started: ${image} (${id})`)

		const {success:inspect, stdout:inspected} = await exec(`docker inspect --format={{.NetworkSettings.IPAddress}} ${id}`, {tracer})
		if (!inspect)
			throw new ItsudenoError(`failed to inspect ${image} (${id})`)
		const ip = inspected.trim()
		return {id, image, ip, async stop() {
			const {success} = await exec(`docker stop ${id}`, {tracer})
			if (!success)
				throw new ItsudenoError(`failed to stop ${image} (${id})`)
			tracer?.debug(`stopped: ${image} (${id})`)
		}}
	}
}
