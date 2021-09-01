//Imports
import {Host} from "@core/inventories"
import {it} from "@core/setup"
import {cli} from "@interfaces/cli"
import {assert, assertEquals, assertThrowsAsync, ItsudenoError, Suite} from "@testing"

//Tests
await new Suite(import.meta.url)
  .group("inventory", test => {
    test("set new host", async () => {
      await it.inventories.default.delete("example.org")
      await cli(["inventory", "set", "example.org", "--add", "--group", "foo", "--property", "foo.bar:boolean=true", "--yes"])
      assertEquals(await it.inventories.default.get("example.org"), new Host(null, {name: "example.org", groups: ["foo"], data: {foo: {bar: true}}}))
    })
    test("set new host (error, already exists)", async () => {
      await it.inventories.default.delete("example.org")
      await it.inventories.default.set("example.org", {groups: ["bar"], data: {foo: {bar: false}}})
      assertThrowsAsync(() => cli(["inventory", "set", "example.org", "--add", "--yes"]), ItsudenoError.Inventory, "already exists")
      assertEquals(await it.inventories.default.get("example.org"), new Host(null, {name: "example.org", groups: ["bar"], data: {foo: {bar: false}}}))
    })

    test("set new host (update)", async () => {
      await it.inventories.default.delete("example.org")
      await it.inventories.default.set("example.org", {groups: ["bar"], data: {foo: {baz: true}}})
      await cli(["inventory", "set", "example.org", "--property", "foo.bar:boolean=true", "--delete-property", "foo.baz", "--group", "foo", "--delete-group", "bar", "--yes"])
      assertEquals(await it.inventories.default.get("example.org"), new Host(null, {name: "example.org", groups: ["foo"], data: {foo: {bar: true}}}))
    })

    test("get host", async () => {
      await it.inventories.default.delete("example.org")
      await it.inventories.default.set("example.org", {})
      await cli(["inventory", "get", "example.org"])
    })

    test("delete host", async () => {
      await it.inventories.default.delete("example.org")
      await it.inventories.default.set("example.org", {})
      await cli(["inventory", "delete", "example.org", "--yes"])
      assert(!await it.inventories.default.has("example.org"))
    })
  })
  .conclude()
