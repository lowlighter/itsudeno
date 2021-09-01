# <%= mod.name %>

<%= mod.about %>

## Arguments

<% if (mod.definition.args) { %>
<% for (const [name, arg] of Object.entries(mod.definition.args)) { %>
<%- await use.component("argument", {name, arg}) %>
<% } %>
<% } else { %>
> This vault does not accept any arguments
<% } %>

___

### Maintainers

<% if (mod.definition.maintainers) { for (const maintainer of mod.definition.maintainers) { %>
* [![<%= maintainer %>](https://github.com/<%= maintainer %>.png?v=3&s=64)](https://github.com/<%= maintainer %>)
<% } } else { %>
> This vault does not have any maintainers yet
<% } %>