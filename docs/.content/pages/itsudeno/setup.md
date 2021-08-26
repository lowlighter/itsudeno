---
title: Itsudeno setup
---

## About setup

*Itsudeno* requires that both controller and targets hosts support [Deno runtime](https://deno.land).

While it can be installed on target hosts using *Itsudeno* itself (provided that controller is able to connect to them), it must be installed first on controller.

See this [Deno install guide](https://deno.land/manual/getting_started/installation) to setup it.

To install `itsudeno` on controller, use the following command:
```
deno install --allow-all --unstable --import-map https://deno.land/x/itsudeno/imports.json --lock https://deno.land/x/itsudeno/lock.json --name itsudeno https://deno.land/x/itsudeno/mod.ts
```

## About settings

*Itsudeno* uses a settings file for customization.

Each executors, inventories, vaults and reporters needs to be configured in order to be usable with *Itsudeno* when using YAML syntax.

View their respective documentation and specifications to learn more about supported arguments.

Configuration is similar for each one:
- An `identifier` that will be available to use in YAML tasks syntax
- A `type` which tell which kind of executor, inventory, vault or reporter is used
- Other supported arguments

```yml
executors:
  executor-identifier:
    type: (executor type, e.g. ssh, local, etc.)
    # ... other arguments
inventories:
  # ...
vaults:
  # ...
reporters:
  # ...
```

Note that order **does** matter, the first executor, inventory, vault or reporter of each respective section will also be labeled and available under `default` name, which is the one used by tasks by default.

For TypeScript users, settings are optional since it is possible to directly instantiate executors, inventories, vaults and reporters.
