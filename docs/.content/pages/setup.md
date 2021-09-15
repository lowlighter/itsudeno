---
title: Itsudeno setup
---

# 🦕 Setup Deno runtime

*Itsudeno* is powered by [Deno runtime](https://deno.land).

While it can be installed on target hosts using *Itsudeno* itself (provided that controller is able to connect to them), it must be installed first on controller.

See this [Deno install guide](https://deno.land/manual/getting_started/installation) for more informations.

# 🦎 Running Itsudeno

## 🦖 From source

*Itsudeno* can be run directly from source.

It is advised to import and use entry points (named `mod.ts`) though it is actually possible to import any file.

[Velociraptor](https://velociraptor.run) can be installed to make use of scripts located in `scripts.yml`.

## 🐉 From CLI

To install `itsudeno` command line interface, use the following command:
```
deno install --allow-all --unstable --import-map https://deno.land/x/itsudeno/imports.json --lock https://deno.land/x/itsudeno/lock.json --name itsudeno https://deno.land/x/itsudeno/mod.ts
```

Use the following command for more informations about `itsudeno`:
```
itsudeno help
```

## 🥚 From executable

Using [Deno compiler](https://deno.land/manual/tools/compiler), it is possible to create standalone *Itsudeno* executable for quick bootstrapping.