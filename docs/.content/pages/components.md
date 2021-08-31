---
title: Itsudeno components
---

# 🍱 Itsudeno components

*Itsudeno* is composed of modules, executors, reporters, inventories and vaults.

Each component is defined by a [specification (`mod.yml`)](/specifications) describing its supported arguments, along with typing, description, constraints, examples, etc.

## 🥡 Modules

Modules can be used to apply templated configuration, create users and files, install packages, make API calls, execute scripts, etc. on target hosts.

They are composed of three methods:
- `past()`, used to collect state before applying any editions
- `check()`, used to preview editions without applying them
- `apply()`, used to apply editions

They are bundled, sent and executed on target hosts using executors.

They try to respect **idempotency** when it is possible, meaning that running the same module with same arguments multiple times will have the same result as running it exactly once.

[See modules list](/modules)

### 🍖 Executors

Executors are the links between *Itsudeno* controller and target hosts.
They bundle, send and execute payload on target hosts.

[See executors list](/executors)

### 🥠 Reporters

Reporters are used to handle modules outcome.
They can be used to print it to console, send it to a remote server, etc.

[See reporters list](/reporters)

## 🍡 Inventories

Inventories are used to store target hosts.
They can be queried to retrieve a subset of hosts.

[See inventories list](/inventories)

### 🍠 Hosts

Hosts are abstraction of inventories entries

They have:
- An unique `name`
- One or more `groups`
- One or more `traits` (at run-time)
- Connection parameters used by `executors`
- Various user-defined `data`

Names, groups and traits are used to query hosts from inventories.

## 🍢 Vaults

Vaults are used to store secrets.
They can be used to store passwords, token and other sensible data.

[See vaults list](/vaults)

## 🍜 Interfaces

Interfaces are used to interact with *Itsudeno* in various ways, like command-line, API endpoints, etc.

[See interfaces list](/interfaces)