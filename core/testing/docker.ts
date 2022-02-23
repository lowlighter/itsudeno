//Imports
import type { Tracer} from "../components/tracer/mod.ts"
import { exec } from "../tools/exec/exec.ts"
import { strcase } from "../../builtin/op/strings/strcase.ts"
import {root} from "../meta/root.ts"
import { join } from "https://deno.land/std@0.123.0/path/mod.ts"
import {ItsudenoError} from "../meta/errors.ts"

/** Docker containers manager for testing purposes */
export class Docker {

	/** Tracer */
	static readonly tracer = null as Tracer|null

	/** Spawn a docker image instance */
	static async spawn(image:string) {
		//Build image
		const dockerfile = join(root.path, "core/testing/containers", strcase(image, {from:"kebab", to:"slash"}), "container.dockerfile")
		const {success:build, stdout:sha256} = await exec(`docker build --quiet --tag ${image} --file ${dockerfile} .`, {tracer:this.tracer})
		if (!build)
			throw new ItsudenoError(`failed to build ${image}`)
		this?.tracer?.debug(`built: ${image} (${sha256})`)

		//Start image
		const {success:run, stdout:id} = await exec(`docker run --detach --rm ${image}`, {tracer:this.tracer})
		if (!run)
			throw new ItsudenoError(`failed to start ${image}`)
		this?.tracer?.debug(`started: ${image} (${id})`)

		//Inspect image
		const {success:inspect, stdout:inspected} = await exec(`docker inspect --format={{.NetworkSettings.IPAddress}} ${id}`, {tracer:this.tracer})
		if (!inspect)
			throw new ItsudenoError(`failed to inspect ${image} (${id})`)
		const ip = inspected.trim()

		//Return image handle
		return {id, image, ip, stop: async() => {
			const {success} = await exec(`docker stop ${id}`, {tracer:this.tracer})
			if (!success)
				throw new ItsudenoError(`failed to stop ${image} (${id})`)
			this?.tracer?.debug(`stopped: ${image} (${id})`)
		}}
	}
}
