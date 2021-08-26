---
title: Itsudeno templating
---

## About templating

*Itsudeno* uses two templating systems:
- [JavaScript template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [Embedded JavaScript templating (EJS)](https://ejs.co/) *(for files)*

### JavaScript template literals

Templating in *Itsudeno* is implicit which is why no backticks (`\\``) are required unlike JavaScript.
Content between a dollar sign and curly brackets (`${}`) will be automatically templated unless escaped.

All features supported by JavaScript can be used, meaning that complex operations can be achieved easily:
```yml
- _: Print current time
  log:
    msg: Current time is ${new Date().toLocaleString()}

- _: Template literals are cool
    msg: |
      ${
        new Array(10).fill(null)
          .map(() => Math.random())
          .filter(x => x > 0.7)
          .sort((a, b) => a - b)
          .reduce((a, b) => a + b, 0)
      }
```

### Embedded JavaScript templating (EJS)

Files templating in *Itsudeno* is performed with EJS (learn more about EJS syntax [here](https://ejs.co/)).

Basically, control blocks (`<%- "<"+"% %"+">" %>`) are used to embed control statements while templated blocks(`<%- "<"+"%= %"+">" %>`, `<%- "<"+"%- %"+">" %>`) are used to outputs returned value:

```yml
- _: Heads or Tails?
  file.content:
    path: /tmp/example
    content: |
      <%- "<"+"%" %> for (let i = 0; i < 10; i++) { <%- "%"+">" %>
        Attempt <%- "<"+"%=" %> i <%- "%"+">" %>: <%- "<"+"%=" %> Math.random() > 0.5 ? "Heads" : "Tails" <%- "%"+">" %>
      <%- "<"+"%" %> } <%- "%"+">" %>
```