---
title: Itsudeno settings
---

# ⚙️ Settings

*Itsudeno* uses a settings file for user customization.

Configuration is mostly optional for TypeScript users, since they can usually access *Itsudeno* components directly.

## 🍱 Configuring components

Configuration is similar for all components:
- An `identifier` which can be used to reference them
- A `type` which indicates the component class
- Other supported arguments (view their respective documentation and specifications for more informations)

Here's the basic structure for components configuration:
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

Note that order **does** matter, as the first component of each respective section will also be labeled and available under `default` name, which is the one used by tasks by default.
