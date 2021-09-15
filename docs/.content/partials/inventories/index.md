---
title: Itsudeno inventories
---

# 🍡 Inventories list

| Name | Description |
| ---- | ----------- |
<% for (const mod of list ) { %>| [<%= mod.index %>](/inventories/<%= mod.index %>) | *<%= mod.about %>* |
<% } %>