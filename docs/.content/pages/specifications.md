---
title: Itsudeno specifications
---

# 🟪 Specifications

*Itsudeno* components are defined by a specification (`mod.yml`) describing its supported arguments (along with typing, description, constraints, etc.).

It is used to generate TypeScript type definition, but also to ease arguments and result validation.

## ☯️ Implicit casting

An implicit casting is automatically performed in order to reach expected typing.

For example, `net.ping` module expects its `packets` argument to be a number, so even if a string argument is provided it will be accepted if it can be safely converted:
```yml
- _: Ping localhost with 4 packets
  net.ping:
    host: 127.0.0.1
    packets: "4" # implicitely casted to a number
```

This is why templating syntax can be used safely, even though they always returns a string:
```yml
- _: Ping localhost with 4 packets
  net.ping:
    host: 127.0.0.1
    packets: ${4} # implicitely casted to a number
```

## ⛎ Values constraints

Arguments may have additional values constraints, in addition to expected typing.

For example, `net.ping` module expects its `packets` argument to be a strictly positive number, so the following is invalid:
```yml
- _: Error
  net.ping:
    host: 127.0.0.1
    packets: -1 # should be > 0
```

Some arguments may only have specific values allowed.

> *🚧 Work in progress*

## ⚛️ Required and optional arguments

Arguments can be either required (must be provided) or optional (set to `null` or default value if defined).

For example, `net.ping` module has `host` as a required argument while `packets` is an optional one with a default value of `4`:
```yml
- _: Ping localhost
  net.ping:
    host: 127.0.0.1 # must be provided
    # packets: 4
```

Default values are implicitely templated, meaning that they can potentially refers to other arguments.

Arguments can also be mutually exclusive with other arguments, or, on the contrary, requires other arguments to be provided when used.

> *🚧 Work in progress*

## ♐ Aliases

Arguments may have aliases for convenience.

For example, `log` module accepts `message` argument to be passed as `msg` instead:
```yml
- _: Say hello world
  log:
    msg: hello world
```

Note that it is not possible to specify the same argument using differents aliases within the same task:
```yml
- _: Error
  log:
    message: hello world
    msg: hello world
```