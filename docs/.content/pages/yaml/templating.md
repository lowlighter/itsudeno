---
title: Itsudeno templating
---

# ✍️ About templating

*Itsudeno* uses two templating systems:
- [JavaScript template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [Embedded JavaScript templating (EJS)](https://ejs.co/) *(for files)*

## 🖊️ JavaScript template literals

Templating in *Itsudeno* is implicit which is why no backticks (<code>&#96;</code>) are required unlike JavaScript.
Content between a dollar sign and curly brackets (`${}`) will be automatically templated unless escaped.

All features supported by JavaScript can be used, meaning that complex operations can be achieved easily:
<%- await example("templating/js.yml") %>

## 🖋️ Embedded JavaScript templating (EJS)

Files templating in *Itsudeno* is performed with EJS (learn more about EJS syntax [here](https://ejs.co/)).

Basically, control blocks (`<%- "<"+"% %"+">" %>`) are used to embed control statements while templated blocks(`<%- "<"+"%= %"+">" %>`, `<%- "<"+"%- %"+">" %>`) are used to outputs returned value:
<%- await example("templating/ejs.yml") %>