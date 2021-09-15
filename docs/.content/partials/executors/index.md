---
title: Itsudeno executors
---

# 🍖 Executors list

| Name | Description |
| ---- | ----------- |
<% for (const mod of list ) { %>| [<%= mod.index %>](/executors/<%= mod.index %>) | *<%= mod.about %>* |
<% } %>