# <%= mod.name %>

<%= mod.about %>

<% if (mod.definition.controller) { %>
<div class="flash mt-3 flash-warn">
This module is always executed on controller, regardless of current executor.
</div>
<% } %>

## Examples

<% if (mod.examples.length) { %>
<% for (const example of mod.examples) { %>
```yml
<%- example %>
```
<% } %>
<% } else { %>
> No examples were defined
<% } %>

## Arguments

<% if (mod.definition.args) { %>
<% for (const [name, arg] of Object.entries(mod.definition.args)) { %>
<%- await use.component("argument", {name, arg}) %>
<% } %>
<% } else { %>
> This module does not accept any arguments
<% } %>

## Past state

<% if (mod.definition.past) { %>
<% for (const [name, arg] of Object.entries(mod.definition.past)) { %>
<%- await use.component("argument", {name, arg}) %>
<% } %>
<% } else { %>
> This module does not collect any past state
<% } %>

## Result

<% if (mod.definition.result) { %>
<% for (const [name, arg] of Object.entries(mod.definition.result)) { %>
<%- await use.component("argument", {name, arg}) %>
<% } %>
<% } else { %>
> This module does not return any result
<% } %>

## Supported platforms

<% if (!mod.implementations.length) { %>
> This module does not have any implementations
<% } %>

<% if (mod.implementations.includes("all.ts")) { %>
This module contains a generic implementation which should work on most operating systems.
<% } %>

<% { const implementations = mod.implementations.filter(implementation => implementation !== "all.ts").map(implementation => implementation.replace(/\.ts$/, "")) %>
<% if (implementations.length) { %>
Specific implementations:
<% for (const implementation of implementations) { %>
* <%= implementation %>
<% } %>
<% } %>
<% } %>

___

### Maintainers

<% if (mod.definition.maintainers) { for (const maintainer of mod.definition.maintainers) { %>
<%- await use.component("maintainer", {maintainer}) %>
<% } } else { %>
> This module does not have any maintainers yet
<% } %>