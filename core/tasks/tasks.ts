//Imports
import {Scope} from "@core/tasks/scope.ts"
import {Host} from "@core/inventories"
import type {outcome} from "@core/modules"
import type {meta} from "@core/tasks"
import {yaml} from "@tools/internal"
import {is} from "@tools/is"
import {Logger} from "@tools/log"
import {ItsudenoError} from "@errors"
import {Executors} from "@executors"
import type {infered, loose} from "@types"
const log = new Logger(import.meta.url)

//Keywords alias
const keywords = Scope.keywords

/** Run tasks */
export async function run({file, meta}: {file: string, meta?: meta}) {
  log.info(`import tasks from: ${file}`)
  const tasks = await yaml<loose[]>(file)
  return _run({outcome: [], scope: await new Scope({meta}).ready, tasks})
}

/** Run tasks (internal method) */
async function _run({outcome, scope, tasks}: {outcome?: Array<outcome<infered, infered, infered, infered>>, scope: Scope, tasks: loose[]}) {
  //Iterate through tasks
  for (const task of tasks) {
    //Extract meta and module statements
    const meta = Object.fromEntries(Object.entries(task).filter(([key]) => keywords.list.includes(key) || keywords.patterns.test(key)))
    const mods = Object.entries(task).filter(([key]) => !(keywords.list.includes(key) || keywords.patterns.test(key)))
    if (mods.length > 1)
      throw new ItsudenoError.Validation(`found more than one module on task: ${mods.join(", ")}`)
    const [module, args] = mods.shift()!

    //Extract loops and create contexts
    const loops = Object.entries(meta).filter(([key]) => keywords.loop.test(key)).map(([key, values]) => [key.replace(keywords.loop, ""), is.array(values) ? values : [values]]) as Array<[string, unknown[]]>
    const contexts = new Array(loops.reduce((a, b) => a * b[1].length, 1)).fill(null).map(() => ({})) as loose[]
    for (const [key, values] of loops) {
      for (let i = 0; i < contexts.length; i += values.length) {
        for (let j = 0; j < values.length; j++)
          contexts[i + j][key] = values[j]
      }
    }
    Object.keys(meta).filter(key => keywords.loop.test(key)).map(key => delete meta[key])

    //Iterate through contexts
    for (const context of contexts) {
      //Create current scope
      scope = await scope.from({meta: meta as meta, context})
      scope.reporter.header(scope)

      //Execute module on targets
      for (const target of await scope.targets) {
        scope.assign({target})
        switch (module) {
          //Tasks (multiple modules)
          case "tasks": {
            if (is.string(args)) {
              log.info(`import tasks from: ${args}`)
              const tasks = await yaml<loose[]>(args)
              await _run({outcome, scope, tasks})
              break
            }
            if (is.array(args)) {
              await _run({outcome, scope, tasks: args as loose[]})
              break
            }
            throw new ItsudenoError.Validation(`expected tasks to be an array or a filepath`)
          }
          //Modules
          default: {
            let outcome
            if ((target.name === Host.local.name) || (scope.executor.instance instanceof Executors.local))
              outcome = await Executors.local.call({target: target.name, name: module, args}, {}, scope.context)
            else
              outcome = await scope.executor.instance.call({target: target.name, name: module, args}, scope.executors.args(target), scope.context)
            await scope.reporter.report(outcome)
          }
        }
      }
    }
  }
  return outcome
}
