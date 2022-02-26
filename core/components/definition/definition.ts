import type {definition, input, output} from "./types.ts"
import {is, to} from "./typing/mod.ts"
import type {Tracer} from "../tracer/mod.ts"
import type {Context} from "../context/mod.ts"
import {ItsudenoError} from "../../meta/errors.ts"
import {template} from "../../tools/template/mod.ts"

  //on?: Record<typeof Deno.build.os, Partial<T>>
 
export async function check(definition:definition, entries:any, {tracer = null, context}:{tracer?:Tracer|null, context?:Context}) {
  return _check(definition.inputs, entries, {name:definition.name, tracer, context, result:{}, errors:[], path:""})
}
  


async function _check(schema:Record<string, input>|null, entries:any, {name, tracer, context, result, errors, path}:{name:string, tracer:Tracer|null, context?:Context, result:any, errors:string[], path:string}) {

  //Without arguments
  if (is.object.empty(schema)) {
    const prefix = `${name}: ${path}`
    tracer?.vvvv(`${prefix} is not expecting arguments`)
    if (!is.object.empty(entries)) {
      errors.push(`${prefix} `)
      tracer?.vvv(errors.at(-1))
    }
  }
  //With arguments
  else {
    for (const [key, {aliases = [], required = false, defaults, deprecated, type, validates = []}] of Object.entries(schema)) {
      const prefix = `${name}: ${path}${path.length ? `.${key}` : key}`
      tracer?.vvvv(`${prefix} is being checked`)
      let value = entries[key]

      //Deprecation message
      if ((deprecated) && (key in entries))
        tracer?.warning(`${prefix} is deprecated, ${deprecated}`)

      //Resolve aliases
      if (aliases.length) {
        const keys = aliases.filter(alias => alias in entries)
        if ((keys.length > 1) || (key in entries)) {
          errors.push(`${prefix} is redefined by ${Deno.inspect(keys)}`)
          tracer?.vvv(errors.at(-1))
          result[key] = new ItsudenoError.Type(errors.at(-1))
          continue
        }
        else if (keys.length === 1) {
          const aliased = keys.shift()!
          value = entries[aliased]
          tracer?.vvvv(`${prefix} is aliased by ${aliased}`)
        }
      }

      //Evaluating value
      for (const _ of [0, 1]) {

        //Template value
        if ((context) && (is.string(value))) {
          const previous = value
          value = await template(value, context.vars, {tracer, inline:true, safe:true})
          if ((!is.object(type))&&(!is[type](value))) {
            tracer?.vvv(`${prefix} should be ${type} but is ${Deno.inspect(value)}, attempting conversion`)
            try {
              value = to[type](value)
              tracer?.vvv(`${prefix} converted to ${type}`)
            }
            catch {
              tracer?.vvv(`${prefix} failed to convert to ${type}`)
            }
          }
          tracer?.vvv(`${prefix} has been templated from ${Deno.inspect(previous)} to ${Deno.inspect(value)}`)
        }

        //Type check (early break)
        if ((!is.object(type))&&(is[type](value))) {
          tracer?.vvv(`${prefix} has correct typing ${type}`)
          break
        }

        //Default value
        if ((!is.void(defaults))&&((is.void(value))||(is.null(value)))) {
          value ??= defaults
          tracer?.vvv(`${prefix} has been defaulted to ${Deno.inspect(defaults)}`)
        }

      }

      //Required value
      if ((required) && (is.void(value))) {
        errors.push(`${prefix} is required`)
        tracer?.vvv(errors.at(-1))
        result[key] = new ItsudenoError.Type(errors.at(-1))
        continue
      }

      //Recursive definition check
      if (is.object(type)) {
        tracer?.vvv(`${prefix} is a complex typing, applying recursive definition check`)
        value ??= {}
        if (!is.object(value)) {
          errors.push(`${prefix} is expected to be object but got ${Deno.inspect(value)} instead`)
          tracer?.vvv(errors.at(-1))
          result[key] = new ItsudenoError.Type(errors.at(-1))
          continue
        }
        result[key] = {}
        await _check(type, value ?? {}, {name, tracer, context, result:result[key], errors, path:`${path}${path.length ? `.${key}` : key}`})
        continue
      }

      //Optional value
      if (is.void(value)) {
        tracer?.vvv(`${prefix} is void, but is not required`)
        continue
      }

      //Type check
      if (!is[type](value)) {
        errors.push(`${prefix} is expected to be ${type} but got ${Deno.inspect(value)} instead`)
        tracer?.vvv(errors.at(-1))
        result[key] = new ItsudenoError.Type(errors.at(-1))
        continue
      }

      /*
      for (const validate of validates) {
        if (!validate(value)) {
          errors.push(`${prefix} is required`)
          tracer?.vvv(errors.at(-1))
        }
      }*/

      result[key] = value

    }

    //Check relationships
    for (const [key, {conflicts = [], depends = []}] of Object.entries(schema)) {
      const prefix = `${name}: ${path}${path.length ? `.${key}` : key}`

      //Resolve conflicts
      for (const conflict of conflicts) {
        const unmet = []
        if (conflict in result) 
          unmet.push(conflict)
        if (unmet.length) {
          errors.push(`${prefix} conflicts with ${unmet.join(", ")}`)
          tracer?.vvv(errors.at(-1))
          result[key] = new ItsudenoError.Type(errors.at(-1))
        }
      }
      //Resolve dependencies
      for (const dependency of depends) {
        const unmet = []
        if (dependency in result) 
          unmet.push(dependency)
        if (unmet.length) {
          errors.push(`${prefix} depends on ${unmet.join(", ")}`)
          tracer?.vvv(errors.at(-1))
          result[key] = new ItsudenoError.Type(errors.at(-1))
        }
      }
    }

  }

  console.log(result, errors)
  return result
}
