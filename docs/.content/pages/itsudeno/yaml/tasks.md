---
title: Itsudeno tasks
---

## About tasks

An *Itsudeno* task is a small [YAML](https://yaml.org/) snippet which is composed of:
- A [module identifier](/about/yaml/modules), which define which payload will be executed on target host
- An [module executor](/about/yaml/executor), which tell how to connect, send and execute module payload on target host
- A [module reporter](/about/yaml/reporters), which handles module output
- An [inventory](/about/yaml/inventories), which contains targets hosts
- A [vault](/about/yaml/vaults), which contains secrets

Here's an example, where the target host will ping its loopback address:
```yml
- _: Ping localhost
  net.ping:
    host: 127.0.0.1
```

### Basic syntax

Tasks are actually handled through arrays, which is why each one is preceded by an hyphen (`-`).
Underscores (`_`) are used to give them a human friendly name.

Tasks can be imported in several ways using `tasks` keyword:
```yml
- _: Import tasks from a relative path to current file
  tasks: example.yml

- _: Import tasks from an absolute path
  tasks: /example.yml

- _: Import tasks from an URL
  tasks: https://deno.land/x/itsudeno/docs/examples/example.yml
```

Tasks can also be defined by passing an array instead:
```yml
- _: A group of tasks
  tasks:
    - _: Say hello world
      log:
        msg: hello world
```

The latter syntax is mostly used to create [scopes](/about/yaml/scopes)

### Specifying *Itsudeno* components

Used executor, inventory, vault and reporter can be specified using the following keywords:
- `using` for executors
- `inventory` for inventories
- `vault` for vaults
- `report` for reporters

Note that as noted in [setup](/about/setup), these must be setup in settings in order to be used.

```yml
- _: Say hello world using "ssh" executor and report it to "console"
  using: ssh
  report: console
  log:
    msg: hello world
```

These are defined for current scope, so any children tasks will inherit from their parent.

### Restricting targets hosts

A task is executed on all hosts of current inventory matching current query (which defaults to `(all)`).

It is possible to restrict targetted hosts using `targets` keyword with one or more queries:
```yml
- _: Say hello world (linux)
  targets: linux
  log:
    msg: hello world

- _: Say hello world (linux or windows)
  targets:
    - linux
    - windows
  log:
    msg: hello world
```

### Looping over data

Repetitive tasks can be factorised using `loop:` keyword, along with an identifier which will be made available in current scope:
```yml
- _: Loop with item=${item}
  loop:item:
    - foo
    - bar
  log:
    msg: ${item}
```

Multiple loops can be used within the same task, from outer loop to inner loop:
```yml
- _: Loop with foo=${foo} and bar=${bar}
  loop:foo: # Outer loop
    - a
    - b
  loop:bar: # Inner loop
    - c
    - d
  log:
    msg: ${foo} ${bar}
```
