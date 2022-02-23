import type {definition, input, output} from "./types.ts"
import {is} from "../tools/is/type.ts"
import type {Tracer} from "../tracer/mod.ts"

//on?: Record<typeof Deno.build.os, Partial<T>>
//for: Array<typeof Deno.build.os>

//inputs: Record<string, input> | null
//outputs: Record<string, output> | null

async function check(definition:definition, entries:any, {tracer}:{tracer:Tracer}) {
  const result = {}
  const errors = []

  // 
  if((is.object.empty(definition.inputs)) && ((is.object.not.empty(entries)))) {
    errors.push(`no argument expected`)
    tracer?.warn(errors.at(-1))
  }
  //
  else if (is.object.not.empty(definition.inputs)) {

    for (const [key, {aliases = [], required = false, defaults, type}] of Object.entries(definition.inputs)) {
      //Resolve aliases
      if (aliases.length) {
        const keys = aliases.filter(alias => alias in entries)
        if ((keys.length > 1) || (key in entries)) {
          errors.push(`${key}: redefined by ${Deno.inspect(keys)}`)
          tracer?.warn(errors.at(-1))
          continue
        }
        const aliased = keys.shift()!
        entries[key] = entries[aliased]
        tracer?.vvv(`${key}: aliased by ${aliased}`)
      }

      //Default value
      if (!is.not.void(defaults)) {
        entries[key] = defaults
        tracer?.vvv(`${key}: defaults to ${Deno.inspect(defaults)}`)
      }

      //Required value
      if ((required) && (!(key in entries))) {
        errors.push(`${key}: required`)
        tracer?.warn(errors.at(-1))
        continue
      }

      //Typing
      
      /** Type */
      //type: string | Record<string, T>
      
      //is[type]()

    }

    for (const [key, {conflicts = [], depends = []}] of Object.entries(definition.inputs!)) {
      //Resolve conflicts
      for (const conflict of conflicts) {
        if (conflict in entries) {
          errors.push(`${key}: conflicts ${conflict}`)
          tracer?.warn(errors.at(-1))
        }
      }
      //Resolve dependencies
      for (const dependency of depends) {
        if (!(dependency in entries)) {
          errors.push(`${key}: depends ${dependency}`)
          tracer?.warn(errors.at(-1))
        }
      }
    }
  }
}



/** Type constraints */
validates?: Array<string | string[]>


/** Deprecation message */
deprecated?: string
/** Overrides */
overrides?: Record<typeof Deno.build.os, Partial<T>>


/** Optional output */
optional?: boolean