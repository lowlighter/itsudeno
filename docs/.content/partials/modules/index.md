---
title: Itsudeno modules
---

# 🥡 Modules

| Name | Description |
| ---- | ----------- |
<% for (const mod of list ) { %>| [<%= mod.index %>](/modules/<%= mod.index %>) | *<%= mod.about %>* |
<% } %>