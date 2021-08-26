---
title: Itsudeno concepts
---

## About Itsudeno components

*Itsudeno* is composed of modules, executors, inventories, vaults and reporters.

Each component is defined by a specification (`mod.yml`) describing its supported arguments (along with typing, description, constraints, etc.).

### Modules

Modules are payloads that are bundled, sent and executed on target hosts through executors.
They are used to apply configuration or execute action on target hosts.

### Executors

Executors are the links between *Itsudeno* controller and target hosts.
They bundle, send and execute payload on target hosts.

### Inventories

Inventories are used to store target hosts.
They can be queried to retrieve a subset of hosts.

### Vaults

Vaults are used to store secrets.
They can be used to store passwords, token and other sensible data.

### Reporters

Reporters are used to handle modules outcome.
They can be used to print it to console, or to send them to a remote server.

### Interfaces

Interfaces are used to interact with *Itsudeno*.

## About Itsudeno syntaxes

*Itsudeno* offers two syntaxes.

### YAML syntax

This syntax is based on the concept of tasks, which are described by a module, an executor, an inventory, a vault, a reporter along with a target host.

It hides complexity and is usually recommended.

### TypeScript syntax

This syntax uses directly *Itsudeno* components and is mostly intended for power users.

