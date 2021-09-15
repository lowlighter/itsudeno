---
title: Itsudeno vaults
---

# 🍢 Vaults list

| Name | Description |
| ---- | ----------- |
<% for (const mod of list ) { %>| [<%= mod.index %>](/vaults/<%= mod.index %>) | *<%= mod.about %>* |
<% } %>