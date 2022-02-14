//Imports
import type {Tracer} from "core/components/tracer/mod.ts"

/** Execution options */
export type options = {tracer?:Tracer|null, stdin?: string | null, piped?:boolean, cwd?: string, env?: {[key:string]:string}}
