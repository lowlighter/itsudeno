# 🍣 Itsudeno

> ⚠️ This project is in active development and will be available at a later date.
>
> ℹ️ Progress can be tracked [here](https://github.com/lowlighter/itsudeno/discussions/3)

*Itsudeno* is a scriptable IT automation system written in [TypeScript](https://github.com/Microsoft/TypeScript) and running on [Deno](https://github.com/denoland/deno).
It can be used to easily deploy and configure applications, services and networks on target hosts.

# 🍱 Features

## 🥢 Choice of paradigm

*Itsudeno* aims to provide maximum flexibility to suit needs, rather than constraining.

Use [YAML](https://yaml.org/) and [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) for declarative programming:

```yml
- _: Set default policy for firewall for ${chain}
  using: ssh
  as: root
  loop:chain:
    - input
    - output
  net.ip.firewall:
    chain: ${chain}
    policy: drop
```

Or use it directly with [TypeScript](https://github.com/microsoft/TypeScript) and [Deno](https://github.com/denoland/deno) for imperative programming:

```ts
import * as it from "https://deno.land/x/itsudeno";

for (const chain of ["input", "output"]) {
  await it.modules.net.ip.firewall({
    _: `Set default policy for firewall for ${chain}`,
    _using:"ssh",
    _as: "root",
    chain,
    policy: "drop",
  });
}
```

### 🍥 Fully-featured language

*Itsudeno* is entirely written in [TypeScript](https://github.com/microsoft/TypeScript) and include type definitions in order to prevent common errors and misuses of modules.

Rather than providing a custom templating engine with limited operations, all JavaScript features are exposed.
File templating use [EJS (Embedded JavaScript templating)](https://ejs.co/).

```yml
- _: Say hello in a random language
  execute:
    command: echo ${["hello", "bonjour", "你好", "こんにちは"][~~(4*Math.random())]}

- _: Template a file content with EJS
  fs.file:
    content: |
      <% for (let i = 0; i < 10; i++) { %>
        Attempt <%= i %>: <%= Math.random() > 0.5 ? "Heads" : "Tails" %>
      <% } %>
```

## 🥡 Powerful modules

*Itsudeno* provides various modules to create users, files, templated configurations, install packages, make API calls, execute scripts, etc.

Modules are built to be **idempotent**, **cross-platform**, **previewable**, **combinable** and **extendable**.

```js
{
  "name": "net.ip.firewall",
  "past": {
    "policy": "accept"
  },
  "result": {
    "policy": "drop"
  },
  // ...
}
```

[Metaprogramming](https://en.wikipedia.org/wiki/Metaprogramming) is used to ease the integration of new features (build type definitions, documentation, validators, autoloading, etc.) so developers can hack *Itsudeno* without difficulty.

### 🍖 Mighty executors

*Itsudeno* handles module executions through the concept of executors.
They bundle modules into JavaScript payload, and send and execute them on target hosts.

There are no operating system limitations for both *Itsudeno* controller and target hosts, except that they must be able to run [Deno](https://github.com/denoland/deno).

```yml
- _: Say hello using SSH
  using: ssh
  log:
    message: hello
```

### 🥠 Awesome reporters

*Itsudeno* handles module outputs through the concept of reporters. For convenience, a default one is provided which should cover most use cases, though it is possible to switch to more complex ones.

```yml
## Set file content ############################################################
- fs.file:
  my.itsudeno.host:
    changes:
      content: "hello world" → "hello itsudeno"
      md5: "5eb63bbbe01eeed093cb22bb8f5acdc3" → "a66afc978304bf6dc01bd684dc211bad"
      permissions: rwxrwxrwx → rw-rw-r-
```

## 🍡 Flexible inventories

*Itsudeno* handles hosts through the concept of inventories. For convenience, a local inventory is provided to ease experimentations, although it is advised to switch to more powerful inventories for larger use cases.

Hosts can be targetted in several ways, like **hostname**, **ip ranges**, and **groups**.
Additional filtering can be performed through **traits**, which are collected automatically at runtime and contain various characteristics like operating system, services, etc.

```yml
- _: Targets hosts in group "webservers" discovered as "debian" hosts on runtime
  targets: webservers (debian)
  tasks:
    - control.noop: # Do something
```

## 🍢 Secured secrets with vaults

*Itsudeno* handles secrets through the concept of vaults. For convenience, a local vault is provided to ease experimentations, although it is advised to switch to more powerful vaults for larger use cases.

```yml
- _: Set password for user
  os.user:
    user: itsudeno
    password: ${await vault.get(`${host.fqdn}_password`)}
```

## 🍜 Intuitive interfaces

*Itsudeno* provides multiple interfaces to manage hosts, such as command-line interface, web API and a web-based user interface.

>  ℹ️ *(more informations about this section will be available at a later date)*

# 🦑 License

```
GNU General Public License v3.0
Copyright (c) 2021-present Simon Lecoq (lowlighter)
```

## 🍙 Contributing

* To report a bug, fill an [issue](https://github.com/lowlighter/itsudeno/issues) describing it.
* To suggest new features or request help, check out [discussions](https://github.com/lowlighter/itsudeno/discussions) instead.
* To contribute, submit a [pull request](https://github.com/lowlighter/itsudeno/pulls).
