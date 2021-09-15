# 🍣 Itsudeno

*Itsudeno* is a scriptable IT automation system written in [TypeScript](https://github.com/Microsoft/TypeScript) and running on [Deno](https://github.com/denoland/deno).
It can be used to easily deploy and configure applications, services and networks on target hosts.

### 🍙 Using YAML

```yml
- _: Set file content
  file.content:
    path: /tmp/itsudeno.example
    content: Hello! Current time is ${new Date()}

- _: Configure firewalls
  loop:chain: [ INPUT, OUTPUT, FORWARD ]
  net.firewall:
    chain: ${chain}
    policy: DROP

- _: Install packages
  packages.apt:
    name: net-tools
    state: latest
```

### 🍘 Using TypeScript

```ts
import * as it from "https://deno.land/x/itsudeno";

await it.tasks(({_, vault, tools}) => {
  for (const user of ["foo", "bar", "baz"]) {
    await _(`Create users and save passwords into default vault`)
      .os.user({
        user,
        password: await vault.get(`${user}_password`, await tools.mkpasswd())
      });
  }

  await _("Wait for user input")
    .wait.user({
      message: "Itsudeno successfully configured your machine, ready?",
      type: "confirm",
    });
});

```

## 🍱 Features

- [x] 🥢 Pick between [YAML and TypeScript](https://itsudeno.land/syntaxes) syntaxes
- [x] 🥡 [Powerful modules](https://itsudeno.land/modules) to create users, files, configurations, install packages, make API calls, execute scripts, etc.
  - [x] Built to be idempotent, cross-platform, previewable and combinable
  - [x] Choose between a wide range of [module executors](https://itsudeno.land/executors) and [module reporters](https://itsudeno.land/reporters)
- [x] 🍡 Store [hosts in inventories](https://itsudeno.land/inventories) and [secrets in vaults](https://itsudeno.land/vaults)
  - [ ] Query hosts with hostname, groups, ip and traits (properties discovered at runtime)
- [ ] 🍜 Control *Itsudeno* with [different interfaces](https://itsudeno.land/interfaces), like CLI, API, web app, etc.
- [x] 🍥 Take advantage of [TypeScript](https://github.com/microsoft/TypeScript), JavaScript and [Deno runtime](https://github.com/denoland/deno)!
  - [x] Never be limited by templating systems anymore, all languages features are exposed
  - [x] Controller can be run on any operating system (provided it supports Deno runtime)
  - [x] Compile your tasks into [packaged executables](https://deno.land/manual/tools/compiler)
  - [ ] Easily import and create third-party components thanks to EcmaScript dynamic imports
- [x] 🥮 [Components documentation](https://itsudeno.land) are auto-generated and always up-to-date

> ⚠️ This project is in active development and some features advertised above may not be implemented yet. Progress can be tracked [here](https://github.com/lowlighter/itsudeno/discussions/3)

### 🍥 Try it know!

```
deno run --allow-all --unstable --import-map https://deno.land/x/itsudeno/imports.json https://deno.land/x/itsudeno/mod.ts run https://deno.land/x/itsudeno/docs/examples/hello.yml
```

## 🦑 Contributions and license

* To report a bug, fill an [issue](https://github.com/lowlighter/itsudeno/issues) describing it.
* To suggest new features or request help, check out [discussions](https://github.com/lowlighter/itsudeno/discussions) instead.
* To contribute, submit a [pull request](https://github.com/lowlighter/itsudeno/pulls).

```
GNU General Public License v3.0
Copyright (c) 2021-present Simon Lecoq (lowlighter)
```
