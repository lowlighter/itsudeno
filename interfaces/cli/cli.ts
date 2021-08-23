//Imports
import {cli as inventory} from "@interfaces/cli/inventory.ts"
import {cli as run} from "@interfaces/cli/run.ts"
import {cli as settings} from "@interfaces/cli/settings.ts"
import {throws} from "@tools/flow"
import {Logger} from "@tools/log"
import {to} from "@tools/to"
import {Command, HelpCommand} from "x/cliffy@v0.19.5/mod.ts"
import {ItsudenoError} from "@errors"
import type {loose} from "@types"
const log = new Logger(import.meta.url)

/** CLI */
//deno-lint-ignore require-await
export async function cli(args: string[]) {
  return new Promise((solve, reject) => {
    new Command()
      .name("itsudeno")
      .version("")
      .description("")
      .arguments("<action>")
      .command(
        "run <file>",
        new Command()
          .description("run itsudeno file")
          .action(execute(run.run)),
      )
      .command(
        "inventory <action>",
        new Command()
          .description("manage inventory")
          .command(
            "get",
            new Command()
              .description("get hosts")
              .option("-i, --inventory <inventory:string>", "inventory name", {default: "default"})
              .option("-t, --targets <query:string>", "target hosts (can be specified multiple times)", {default: "(all)", collect: true})
              //.option("-c, --collect-traits", "allow remote connections to collect traits")
              .example("get all hosts", "itsudeno inventory get")
              .example("get hosts by groups", "itsudeno inventory get --targets servers")
              .example("get hosts by groups and traits", "itsudeno inventory get --collect-traits --targets 'servers (debian)'")
              .action(execute(inventory.get)),
          )
          .command(
            "set",
            new Command()
              .description("set or update hosts")
              .option("-i, --inventory <inventory:string>", "inventory name", {default: "default"})
              .option("-t, --targets <query:string>", "target hosts (can be specified multiple times)", {collect: true, conflicts: ["add"]})
              //.option("-c, --collect-traits", "allow remote connections to collect traits")
              .option("-a, --add <host:string>", "add host (can be specified multiple times)", {collect: true, conflicts: ["targets"]})
              .option("-p, --property <property:string>", "set or update property (can be specified multiple times)", {collect: true, value: parse.bind(null, {action: "set"})})
              .option("-P, --delete-property <property:string>", "delete property (can be specified multiple times)", {collect: true, value: parse.bind(null, {action: "delete", values: false})})
              .option("-g, --group <group:string>", "add host to group (can be specified multiple times)", {collect: true, value: parse.bind(null, {action: "set", values: false})})
              .option("-G, --delete-group <group:string>", "delete host from group (can be specified multiple times)", {collect: true, value: parse.bind(null, {action: "delete", values: false})})
              .option("-y, --yes", "skip confirmation prompt")
              .example("add new host", "itsudeno inventory set --add example.org --property ssh.user=root --property ssh.port:number=22")
              .example("update hosts by groups", "itsudeno inventory set --targets servers --property hello=world")
              .action(execute(inventory.set)),
          )
          .command(
            "delete",
            new Command()
              .description("delete hosts")
              .option("-i, --inventory <inventory:string>", "inventory name", {default: "default"})
              .option("-t, --targets <query:string>", "target hosts", {required: true, collect: true})
              //.option("-c, --collect-traits", "allow remote connections to collect traits")
              .option("-y, --yes", "skip confirmation prompt")
              .example("delete host", "itsudeno inventory delete --targets example.org")
              .action(execute(inventory.delete)),
          ),
      )
      .command(
        "settings",
        new Command()
          .description("manage settings")
          .arguments("<action>")
          .command(
            "show",
            new Command()
              .description("display current settings")
              .action(execute(settings.show)),
          ),
      )
      .command(
        "hack",
        new Command()
          .description("helper to easily extends itsudeno features")
          .action(execute(() => throws(new ItsudenoError.Unsupported()))),
      )
      .command(
        "help",
        new HelpCommand()
          .arguments("[action]")
          .description("display command help"),
      )
      .helpOption("-h, --help", "display help")
      .versionOption("--version", "display current version")
      .parse(args)

    /** Executer wrapper */
    //deno-lint-ignore ban-types
    function execute(command: Function) {
      return async function() {
        try {
          solve(await command(...arguments))
        }
        catch (error) {
          reject(error)
        }
      }
    }
  })
}

/** Parse key-types-values */
function parse({values = true, ...context}: loose, input: string, collected = [] as loose[]) {
  if (values) {
    //Extract key, type and value
    const format = /^(?<key>[\s\S]+?)(?::(?<type>[\s\S]+?))?=(?<value>[\s\S]+)$/
    if (!format.test(input))
      throw new ItsudenoError.Validation(`expected format is <key>[:type]=<value> (got "${input}" instead)`)
    let {key, type = "any", value} = input.match(format)?.groups ?? {}

    //Convert value
    if (!(type in to)) {
      log.warn(`ignoring unknown type conversion: ${type}`)
      type = "any"
    }
    collected.push({...context, key, value: to[type as keyof typeof to](value)})
  }
  else {
    collected.push({...context, key: input})
  }
  return collected
}
