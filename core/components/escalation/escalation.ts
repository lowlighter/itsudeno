//Imports
import {Component} from "../component/component.ts"
import type {result} from "./types.ts"

/** Generic escalation */
export abstract class Escalation extends Component {

    /** Command handler */
    abstract handle(command:string):Promise<result>

}