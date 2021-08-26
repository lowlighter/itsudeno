## <%= mod.name %>

<%= mod.about %>

### Arguments

<% if (mod.definition.args) { %>
<% for (const [name, arg] of Object.entries(mod.definition.args)) { %>
<%- await use.component("argument", {name, arg}) %>
<% } %>
<% } else { %>
> This executor does not accept any arguments
<% } %>

___

#### Maintainers

<% if (mod.maintainers) { for (const maintainer of mod.maintainers) { %>
* [![<%= maintainer %>](https://github.com/<%= maintainer %>.png?v=3&s=64)](https://github.com/<%= maintainer %>)
<% } } else { %>
> This executor does not have any maintainers yet
<% } %>