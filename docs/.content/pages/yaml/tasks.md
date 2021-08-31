---
title: Itsudeno tasks
---

# 🟦 Tasks

An *Itsudeno* task is a small [YAML](https://yaml.org/) snippet which is composed of:
- A [module identifier](/modules), which define which payload will be executed on target host
- An [module executor](/executors), which tell how to connect, send and execute module payload on target host
- A [module reporter](/reporters), which handles module output
- An [inventory](/inventories), which contains targets hosts
- A [vault](/vaults), which contains secrets

Here's an example, where the target host will ping its loopback address:
<%- await example("tasks/example.yml") %>

## #️⃣ Basic syntax

Tasks are actually handled through arrays, which is why each one is preceded by an hyphen (`-`).
Underscores (`_`) are used to give them a human friendly name.

Tasks can be imported in several ways using `tasks` keyword:
<%- await example("tasks/tasks_import.yml") %>

Tasks can also be defined by passing an array instead:
<%- await example("tasks/tasks_group.yml") %>

The latter syntax is mostly used to create [scopes](/yaml/scopes)

## 🔣 Specifying *Itsudeno* components

Used executor, inventory, vault and reporter can be specified using the following keywords:
- `using` for executors
- `inventory` for inventories
- `vault` for vaults
- `report` for reporters

Note that as noted in [setup](/setup), these must be setup in settings in order to be used.
<%- await example("tasks/components.yml") %>

These are defined for current scope, so any children tasks will inherit from their parent.

## 🔛 Restricting targets hosts

A task is executed on all hosts of current inventory matching current query (which defaults to `(all)`).

It is possible to restrict targetted hosts using `targets` keyword with one or more queries:
<%- await example("tasks/targets.yml") %>

## 🔁 Looping over data

Repetitive tasks can be factorised using `loop:` keyword, along with an identifier which will be made available in current scope:
<%- await example("tasks/loop_simple.yml") %>

Multiple loops can be used within the same task, from outer loop to inner loop:
<%- await example("tasks/loop_nested.yml") %>
