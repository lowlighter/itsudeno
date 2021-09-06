//Imports
import {cli as inventory} from "@interfaces/cli/inventory.ts"
import {cli as run} from "@interfaces/cli/run.ts"
import {cli as settings} from "@interfaces/cli/settings.ts"
import {cli as vault} from "@interfaces/cli/vault.ts"
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
          .option("-I, --inventory <inventory:string>", "inventory name", {default: "default"})
          .option("-V, --vault <vault:string>", "vault name", {default: "default"})
          .option("-R, --reporter <reporter:string>", "reporter name", {default: "default"})
          .option("-T, --targets <targets:string>", "targets query (can be specified multiple times)", {collect: true, default: "(all)"})
          .action(execute(run.run)),
      )
      .command(
        "inventory <action>",
        new Command()
          .description("manage inventories")
          .command(
            "get <targets...:string>",
            new Command()
              .description("get hosts")
              .option("-I, --inventory <inventory:string>", "inventory name", {default: "default"})
              .option("-t, --traits", "allow remote connections to collect traits")
              .example("get all hosts", "itsudeno inventory get")
              .example("get hosts by groups", "itsudeno inventory get group")
              .example("get hosts by groups and traits", "itsudeno inventory get 'group (trait)' --traits")
              .action(execute(inventory.get)),
          )
          .command(
            "set <targets...:string>",
            new Command()
              .description("set or update hosts")
              .option("-I, --inventory <inventory:string>", "inventory name", {default: "default"})
              .option("-t, --traits", "allow remote connections to collect traits")
              .option("-a, --add", "add hosts if they do not exists (targets should be hostname when using this option)")
              .option("-p, --property <property:string>", "set or update property (can be specified multiple times)", {collect: true, value: parse.bind(null, {action: "set"})})
              .option("-P, --delete-property <property:string>", "delete property (can be specified multiple times)", {collect: true, value: parse.bind(null, {action: "delete", values: false})})
              .option("-g, --group <group:string>", "add host to group (can be specified multiple times)", {collect: true, value: parse.bind(null, {action: "set", values: false})})
              .option("-G, --delete-group <group:string>", "delete host from group (can be specified multiple times)", {collect: true, value: parse.bind(null, {action: "delete", values: false})})
              .option("-y, --yes", "skip confirmation prompt")
              .example("add new host", "itsudeno inventory set example.org --add --property ssh.user=root --property ssh.port:number=22")
              .example("update hosts by groups", "itsudeno inventory set group --property hello=world")
              .action(execute(inventory.set)),
          )
          .command(
            "delete <targets...:string>",
            new Command()
              .description("delete hosts")
              .option("-I, --inventory <inventory:string>", "inventory name", {default: "default"})
              .option("-t, --traits", "allow remote connections to collect traits")
              .option("-y, --yes", "skip confirmation prompt")
              .example("delete host", "itsudeno inventory delete example.org")
              .example("delete hosts by groups", "itsudeno inventory delete group")
              .action(execute(inventory.delete)),
          ),
      )
      .command(
        "vault <action>",
        new Command()
          .description("manage vaults")
          .command(
            "get <secret:string>",
            new Command()
              .description("get secrets")
              .option("-V, --vault <vault:string>", "vault name", {default: "default"})
              .example("get secret", "itsudeno vault get secret")
              .action(execute(vault.get)),
          )
          .command(
            "set <secret:string>",
            new Command()
              .description("update secrets")
              .option("-V, --vault <vault:string>", "vault name", {default: "default"})
              .option("-y, --yes", "skip confirmation prompt")
              .option("-v, --value", "set value without prompt", {depends: ["yes"]})
              .example("add new secret", "itsudeno vault set secret")
              .action(execute(vault.set)),
          )
          .command(
            "delete <secret:string>",
            new Command()
              .description("delete secrets")
              .option("-V, --vault <vault:string>", "vault name", {default: "default"})
              .option("-y, --yes", "skip confirmation prompt")
              .example("delete secret", "itsudeno vault delete secret")
              .action(execute(vault.delete)),
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
