# <%= mod.name %>

<%= mod.about %>

<% if (mod.definition.controller) { %>
<div class="flash mt-3 flash-warn">
This module is always executed on controller, regardless of current executor.
</div>
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

___

### Maintainers

<% if (mod.maintainers) { for (const maintainer of mod.maintainers) { %>
* [![<%= maintainer %>](https://github.com/<%= maintainer %>.png?v=3&s=64)](https://github.com/<%= maintainer %>)
<% } } else { %>
> This module does not have any maintainers yet
<% } %>