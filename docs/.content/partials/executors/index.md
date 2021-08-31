---
title: Itsudeno executors
---

# 🍖 Executors

| Name | Description |
| ---- | ----------- |
<% for (const mod of list ) { %>| [<%= mod.index %>](/executors/<%= mod.index %>) | *<%= mod.about %>* |
<% } %>