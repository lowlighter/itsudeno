//Imports
import {Host} from "@core/inventories"
import {is} from "@tools/is"
import {Inventories} from "@inventories"
import {assert, assertEquals, assertNotEquals, assertThrowsAsync, ItsudenoError, Suite} from "@testing"
import type {test} from "@testing"

//Tests
const suite = new Suite(import.meta.url)
for (const [type, Inventory] of Object.entries(Inventories) as test) {
  //Hosts
  const hosts = {
    "a.it": {
      groups: ["tests/1"],
    },
    "b.it": {
      groups: ["tests/1"],
    },
    "c.it": {
      groups: ["tests/2"],
    },
  }
  const Hosts = new Map(Object.entries(hosts).map(([name, host]) => [name, new Host(null, {name, ...host})]))

  //Open a new inventory instance and populate it
  const setup = async function() {
    const inventory = await Inventory.open()
    for (const key of await inventory.list())
      await inventory.delete(key)
    for (const [key, value] of Object.entries(hosts))
      await inventory.set(key, value)
    return inventory
  }

  //Test each inventory
  suite.group(type, test => {
    test("inventory definition", async () => {
      const inventory = await setup()
      const {description, args} = inventory.definition
      assert(is.string(description), `missing description in ${type}/mod.yml`)
      assert(is.object(args) || is.null(args), `missing args in ${type}/mod.yml`)
    })

    test("list hosts", async () => {
      const inventory = await setup()
      assertEquals(await inventory.list(), Object.keys(hosts).sort())
    })

    test("has existing host", async () => {
      const inventory = await setup()
      for (const [key] of Object.entries(hosts))
        assert(await inventory.has(key))
    })
    test("has not unknown host", async () => {
      const inventory = await setup()
      assert(!await inventory.has("null.it"))
    })

    test("get existing host", async () => {
      const inventory = await setup()
      for (const [key] of Object.entries(hosts))
        assertEquals(await inventory.get(key), Hosts.get(key))
    })
    test("get unknown host", async () => {
      const inventory = await setup()
      await assertThrowsAsync(() => inventory.get("null.it"), ItsudenoError.Inventory, "unknown host")
    })

    test("create new host", async () => {
      const inventory = await setup()
      assert(!await inventory.has("null.it"))
      await inventory.set("null.it", {groups: ["tests/x"], data: {itsudeno: true}})
      assertEquals(await inventory.get("null.it"), new Host(null, {name: "null.it", groups: ["tests/x"], data: {itsudeno: true}}))
    })
    test("update existing host", async () => {
      const inventory = await setup()
      for (const [key] of Object.entries(hosts)) {
        const value = `${-Math.random()}`
        const expected = new Host(null, {name: key, ...(hosts as test)[key], data: {value}})
        assertNotEquals(await inventory.get(key), expected)
        await inventory.set(key, {data: {value}})
        assertEquals(await inventory.get(key), expected)
      }
    })

    test("delete unknown host", async () => {
      const inventory = await setup()
      assert(!await inventory.has("null.it"))
      await inventory.delete("null.it")
      assert(!await inventory.has("null.it"))
    })
    test("delete existing host", async () => {
      const inventory = await setup()
      for (const [key] of Object.entries(hosts)) {
        assert(await inventory.has(key))
        await inventory.delete(key)
        assert(!await inventory.has(key))
      }
    })
  })
}
await suite.conclude()
