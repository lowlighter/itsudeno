//Imports
import type {Escalation} from "../escalation/escalation.ts"

/** Connector options */
export type options = {
    escalation:Escalation,
    permissions?:permissions
}

/** Deno permissions */
export type permissions = {
    all?:boolean
    hrtime?:boolean
    plugin?:boolean
    read?:boolean|string[]
    write?:boolean|string[]
    net?:boolean|string[]
    run?:boolean|string[]
    env?:boolean|string[]
    ffi?:boolean|string[]
}

/** Result */
export type result = {
    command:string
    stdin?:string
}