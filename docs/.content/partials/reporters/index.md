---
title: Itsudeno reporters
---

# 🥠 Reporters list

| Name | Description |
| ---- | ----------- |
<% for (const mod of list ) { %>| [<%= mod.index %>](/reporters/<%= mod.index %>) | *<%= mod.about %>* |
<% } %>