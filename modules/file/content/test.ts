//Imports
import {Suite} from "@testing"

//Tests
await new Suite.Modules(import.meta.url)
  .idempotent({
    args: {content: "foo", path: "/home/it/test"},
    success: true,
    past: {content: null, md5: null},
    result: {content: "foo", md5: "acbd18db4cc2f85cedef654fccc4a4d8"},
  })
  .conclude()
