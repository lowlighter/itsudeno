//Imports
import {is} from "@tools/is"
import {Logger} from "@tools/log"
import {deepmerge} from "@tools/std"
import {template} from "@tools/template"
import {to} from "@tools/to"
import {ItsudenoError} from "@errors"
import type {infered, loose} from "@types"
const log = new Logger(import.meta.url)

/** Validate a set of arguments against a specs definition */
//deno-lint-ignore ban-types
export async function validate<T extends {}, U = T>(args: T | null, definition: definitions | null, {mode = "input", strategy = "delayed", strict = false, context = {}, override = ""}: {mode?: mode, strategy?: strategy, strict?: boolean, context?: loose, override?: string}) {
  const report = new Report({strategy, strict})
  const validated = {} as loose
  log.vvvv(`validating definition with override: ${override || "(none)"}`)
  definition = overrides(definition, {override}) as typeof definition
  if (is.null(await check(args, definition, {validated, mode, report, context, defaults: await defaults(definition, {context, args: args as infered, report})})))
    return null
  report.summary()
  return validated as unknown as U
}

/** Validate and format a set of arguments against a specs partial definition */
async function check<T>(args: T, definition: definitions | null, {validated, report, mode, context, defaults}: {validated: loose, report: Report, mode: mode, context: loose, defaults: loose}) {
  //Handle empty definitions
  if (is.null(definition)) {
    if ((is.null(args)) || (is.object.empty(args)))
      return null
    report.add(new ItsudenoError.Validation("no argument allowed"))
    return
  }

  //General checks
  if (!is.object(args)) {
    report.add(new ItsudenoError.Validation(`expected arguments to be of type object (got ${args === null ? "null" : typeof args} instead)`))
    return
  }

  //Process relations
  if (mode === "input") {
    //Process aliases
    let valid = true
    for (const [key, {aliases: _aliases = []}] of Object.entries(definition) as infered) {
      const aliases = [..._aliases].filter((alias: string) => alias in args)
      if (aliases.length) {
        if ((aliases.length > 1) || (key in args)) {
          report.add(new ItsudenoError.Validation(`"${key}" is defined multiple times through one of its aliases: ${JSON.stringify(aliases)}`))
          valid = false
          continue
        }
        const alias = aliases.shift()! as keyof typeof args
        args[key as keyof typeof args] = args[alias]
        delete args[alias]
        log.vvvv(`"${key}" populated by alias "${alias}"`)
      }
    }

    //Process relations
    for (const [key, {aliases: _aliases = [], conflicts = [], requires = []}] of Object.entries(definition) as infered) {
      if (!is.object.with(args, key))
        continue

      //Process conflicts
      for (const conflict of conflicts) {
        if (is.object.with(args, conflict)) {
          report.add(new ItsudenoError.Validation(`"${key}" cannot be used with "${conflict}"`))
          valid = false
        }
      }

      //Process requirements
      for (const require of requires) {
        if (!is.object.with(args, require)) {
          report.add(new ItsudenoError.Validation(`"${key}" is required with "${require}"`))
          valid = false
        }
      }
    }
    if (!valid)
      return
  }

  //Process values
  for (const [key, schema] of Object.entries(definition) as infered) {
    //Check documentation and schemas
    const warning = (mode === "output")
    if (report.strict) {
      const {description, examples = []} = schema
      if (!description)
        report.add(new ItsudenoError.Validation(`"${key}" has no description`), {warning: true})
      for (const example of examples) {
        try {
          const {type, match, values} = schema
          await check({[key]: example}, {[key]: {description: "<example>", type, match, values}}, {validated: {}, report: new Report({strategy: "failfast", strict: true}), mode, context, defaults})
        }
        catch (error) {
          report.add(new ItsudenoError.Validation(`"${key}" has an invalid example: ${example} (${error.message})`), {warning: true})
        }
      }
      if ((schema.required) && (schema.default))
        report.add(new ItsudenoError.Validation(`"${key}" cannot have a default value when it is also required`))
    }

    //Deprecation message
    const {deprecated} = schema
    if (deprecated)
      report.add(new ItsudenoError.Validation(`"${key}" is deprecated (${deprecated})`), {warning: true})

    //Recursive check for sub-definitions
    let {type} = schema
    let value = args[key as keyof typeof args] as unknown ?? null
    if (is.object(type)) {
      if (is.null(value))
        value = {}
      if (!is.object(value)) {
        report.add(new ItsudenoError.Validation(`"${key}" must match nested type definition (got ${value === null ? "null" : typeof value} instead)`), {warning})
        if ((mode === "output") && (!report.strict))
          validated[key] = value
        continue
      }
      log.vvvv(`"${key}" is a nested type, applying recursive checks`)
      check(value, type, {validated: validated[key] = {}, defaults: defaults[key] as loose ?? {}, report, mode, context})
      continue
    }

    //Handle array and objects types
    const array = /\[\]$/.test(type)
    const object = /\{\}$/.test(type)
    if (array) {
      log.vvvv(`"${key}" is of type array[], altering future checks behaviour for this key`)
      type = (type as string).replace(/\[\]$/, "")
    }
    if (object) {
      log.vvvv(`"${key}" is of type object{}, altering future checks behaviour for this key`)
      type = (type as string).replace(/\{\}$/, "")
    }

    //Ensure type guards and converters are defined
    let match = (schema.match ?? []).slice()
    if (!is.array(match))
      match = [match]
    for (const [key, value] of Object.entries(match)) {
      if (!is.array(value))
        match[key] = [value]
      match[key] = match[key].map((guard: string) => `${type}.${guard}`)
    }
    const missing = new Set([type, ...match].flat().map(guard => guard.replace(/\([\s\S]*\)$/, "")).filter(guard => !is.object.with(is, guard)))
    if (missing.size) {
      missing.forEach((guard: string) => report.add(new ItsudenoError.Validation(`unknown type guard: ${guard}`)))
      continue
    }
    if (!is.object.with(to, type)) {
      report.add(new ItsudenoError.Validation(`unknown type converter: ${type}`))
      continue
    }

    //Template value if possible
    if (is.string(value)) {
      log.vvvv(`"${key}" applying implicit safe templating as given value is type of string`)
      value = await template(value, context, {safe: true, mode: "js", warn: true})
    }

    //Set default value if needed
    const {default: defaulted} = schema
    if (mode === "input") {
      if (!is.void(defaulted))
        value ??= defaults[key]
    }

    //Type conversion
    try {
      if ((!is.void(value)) && (!is.null(value))) {
        //Apply conversion for each value for arrays (and implicitely convert single value to array if needed)
        if (array) {
          if (!is.array(value)) {
            log.vvvv(`"${key}" was implictely converted into array to match exepected type`)
            value = [value]
          }
          value = (value as unknown[]).map(value => to[type as keyof typeof to](value) ?? null)
        }
        //Apply conversion for each value for objects
        else if (object) {
          if (!is.object(value)) {
            report.add(new ItsudenoError.Validation(`"${key}" must be of an object of ${type} (got ${typeof value} instead)`), {warning})
            continue
          }
          value = Object.fromEntries(Object.entries(value as loose ?? {}).map(([key, value]) => [key, to[type as keyof typeof to](value) ?? null]))
        }
        //Apply conversion for primitives
        else {
          value = to[type as keyof typeof to](value) ?? null
        }
      }
    }
    catch {
      //Ignore errors
    }

    //Required and optional check
    const {required = false, optional = false} = schema
    if (is.null(value)) {
      if ((mode === "input") && (required)) {
        report.add(new ItsudenoError.Validation(`"${key}" is required`))
        continue
      }
      if ((mode === "output") && (!optional))
        report.add(new ItsudenoError.Validation(`"${key}" is empty (set it to optional if this is expected)`), {warning: true})
      validated[key] = value
      continue
    }

    //Value checks
    {
      let values = [...[value].entries()] as Array<[unknown, unknown]>
      let register = ({value}: loose) => validated[key] = value
      if (array) {
        values = [...(value as unknown[]).entries()]
        validated[key] = []
        register = ({value}: loose) => (validated[key] as unknown[]).push(value)
      }
      if (object) {
        values = [...Object.entries(value as loose)]
        validated[key] = {}
        register = ({key, value}: loose) => validated[key as keyof typeof validated] = value
      }
      for (const [key, value] of values) {
        //Type check
        if (!is[type as keyof typeof is](value)) {
          report.add(new ItsudenoError.Validation(`"${key}" must be of type ${type} (got ${typeof value} instead)`), {warning})
          if (warning)
            register({key, value})
          continue
        }
        //Type constraints
        if (match.length) {
          let valid = false
          matching:
          for (const guards of match) {
            for (const guard of guards) {
              if (!is(guard, value))
                continue matching
            }
            valid = true
          }
          if (!valid) {
            report.add(new ItsudenoError.Validation(`"${key}" does not satisfy any additional type constraints sets`), {warning})
            if (warning)
              register({key, value})
            continue
          }
        }

        //Allowed values check
        const {values = [] as string[]} = schema
        if ((values.length) && (!(values as unknown[]).includes(value))) {
          report.add(new ItsudenoError.Validation(`"${key}" must be one of ${JSON.stringify(values)} (got ${value} instead)`), {warning})
          if (warning)
            register({key, value})
          continue
        }

        //Store checked value
        register({key, value})
      }
    }
  }

  //Forbid unsupported keys
  const supported = Object.entries(definition).flatMap(([key, {aliases = []}]) => [key, ...aliases])
  for (const key in args) {
    if (!supported.includes(key))
      report.add(new ItsudenoError.Validation(`"${key}" is not a valid argument`), {warning: true})
  }
}

/** Build defaults object */
async function defaults(definition: definitions | null, {context, args, report}: {context: loose, args: loose, report: Report}, object = {} as loose) {
  if (is.null(definition))
    return object
  for (const [key, value] of Object.entries(definition) as infered) {
    if (is.object(value.type))
      object[key] = await defaults(value.type, {context, args, report}, object)
    else if ("default" in value) {
      try {
        if (typeof value.default === "string")
          object[key] = await template(value.default, deepmerge(deepmerge(object, context), args))
        else
          object[key] = value.default
      }
      catch (error) {
        report.add(new ItsudenoError.Validation(`"${key}" default value could not be templated correctly: ${error.message}`), {warning: true})
        object[key] = value.default
      }
    }
  }
  return object
}

/** Build overriden definition */
function overrides(definition: definitions | null, {override}: {override?: string} = {}, object = {} as loose) {
  if (is.null(definition))
    return null
  for (const [key, value] of Object.entries(definition) as infered) {
    if (is.object(value.type))
      object[key] = {...value, type: overrides(value.type, {override})}
    else if ((override) && (value.overrides) && (!is.object.empty(value.overrides[override] ?? {})))
      object[key] = deepmerge(value, value.overrides[override])
    else
      object[key] = value
    delete (object[key] as loose).overrides
  }
  return object
}

/** Validation reporter */
class Report {
  /** Current errors */
  readonly errors = [] as ItsudenoError[]

  /** Current warnings */
  readonly warnings = [] as ItsudenoError[]

  /** Reporting strategy */
  readonly strategy

  /** Whether to consider warnings as errors */
  readonly strict

  /** Constructor */
  constructor({strategy, strict = false}: {strategy: strategy, strict?: boolean}) {
    this.strategy = strategy
    this.strict = strict
  }

  /** Add validation error */
  add(error: ItsudenoError, {warning = false} = {}) {
    if (this.strict)
      warning = false
    if ((this.strategy === "failfast") && (!warning))
      throw error
    warning ? this.warnings.push(error) : this.errors.push(error)
  }

  /** Print warnings and throws errors */
  summary() {
    if (this.warnings.length)
      log.warn(...this.warnings.map(error => error.message))
    if (this.errors.length)
      throw new ItsudenoError.Validation(`validation errors:\n${this.errors.map(error => `  - ${error.message}`).join("\n")}`)
  }
}

/** Reporting strategy */
export type strategy = "failfast" | "delayed"

/** Validation mode */
export type mode = "input" | "output"

/** Definitions */
export type definitions = definition<input> | definition<output>

/** Definition */
export interface definition<T> {
  [key: string]: T
}

/** Input schema */
export interface input {
  /** Description */
  description: string
  /** Type */
  type: string | {[key: string]: input}
  /** Type constraints */
  match?: Array<string | string[]>
  /** Whether argument is required */
  required?: boolean
  /** Default value */
  default?: unknown
  /** Allowed values */
  values?: unknown[]
  /** Examples */
  examples?: unknown[]
  /** Aliases */
  aliases?: string[]
  /** Deprecated */
  deprecated?: string
  /** Conflicting options */
  conflicts?: string[]
  /** Required options */
  requires?: string[]
  /** Overrides */
  overrides?: {[key: string]: Partial<input>}
}

/** Output schema */
export interface output {
  /** Description */
  description: string
  /** Type */
  type: string | {[key: string]: output}
  /** Type constraints */
  match?: Array<string | string[]>
  /** Whether result is optional and not always present */
  optional?: boolean
  /** Allowed values */
  values?: unknown[]
  /** Examples */
  examples?: unknown[]
  /** Deprecated */
  deprecated?: string
  /** Overrides */
  overrides?: {[key: string]: Partial<output>}
}
