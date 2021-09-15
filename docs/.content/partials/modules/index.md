---
title: Itsudeno modules
---

# 🥡 Modules list

| Name | Description |
| ---- | ----------- |
<% for (const mod of list ) { %>| [<%= mod.index %>](/modules/<%= mod.index %>) | *<%= mod.about %>* |
<% } %>