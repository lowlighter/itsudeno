---
title: Itsudeno syntaxes
---

# 🍥 About Itsudeno syntaxes

*Itsudeno* offers two syntaxes.

## 🍙 YAML syntax

This syntax is based on the concept of tasks, which are described by a module, an executor, an inventory, a vault, a reporter and a target host.

Control statements are also supported (loops, conditionals, includes, etc.) which allow for complex execution runs:

<%- await example("syntaxes/syntax.yml") %>

It is recommended for most usages and should be able to cover most use cases.

## 🍘 TypeScript syntax

This syntax uses *Itsudeno* components directly, and is mostly intended for power users.

<%- await example("syntaxes/syntax.ts") %>
