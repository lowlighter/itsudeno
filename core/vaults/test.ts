//Imports
import {is} from "@tools/is"
import {assert, assertEquals, assertNotEquals, assertStrictEquals, assertThrowsAsync, ItsudenoError, Suite} from "@testing"
import type {test} from "@testing"
import {Vaults} from "@vaults"

//Tests
const suite = new Suite(import.meta.url)
for (const [type, Vault] of Object.entries(Vaults) as test) {
  //Secrets
  const secrets = {
    "tests/string": `${Math.random()}`,
    "tests/number": Math.random(),
    "tests/boolean": Math.random() > .5,
  }

  //Open a new vault instance and populate it
  const setup = async function() {
    const vault = await Vault.open()
    for (const key of await vault.list())
      await vault.delete(key)
    for (const [key, value] of Object.entries(secrets))
      await vault.set(key, value)
    return vault
  }

  //Test each vault
  suite.group(type, test => {
    test("vault definition", async () => {
      const vault = await setup()
      const {description, args} = vault.definition
      assert(is.string(description), `missing description in ${type}/mod.yml`)
      assert(is.object(args) || is.null(args), `missing args in ${type}/mod.yml`)
    })

    test("list secrets", async () => {
      const vault = await setup()
      assertEquals(await vault.list(), Object.keys(secrets).sort())
    })

    test("has existing secret", async () => {
      const vault = await setup()
      for (const [key] of Object.entries(secrets))
        assert(await vault.has(key))
    })
    test("has not unknown secret", async () => {
      const vault = await setup()
      assert(!await vault.has("tests/null"))
    })

    test("get existing secret", async () => {
      const vault = await setup()
      for (const [key, value] of Object.entries(secrets))
        assertStrictEquals(await vault.get(key), value)
    })
    test("get unknown secret", async () => {
      const vault = await setup()
      await assertThrowsAsync(() => vault.get("tests/null"), ItsudenoError.Vault, "unknown secret")
    })

    test("create new secret", async () => {
      const vault = await setup()
      assert(!await vault.has("tests/null"))
      await vault.set("tests/null", "itsudeno")
      assertStrictEquals(await vault.get("tests/null"), "itsudeno")
    })
    test("update existing secret", async () => {
      const vault = await setup()
      for (const [key] of Object.entries(secrets)) {
        const value = `${-Math.random()}`
        assertNotEquals(await vault.get(key), value)
        await vault.set(key, value)
        assertStrictEquals(await vault.get(key), value)
      }
    })

    test("delete unknown secret", async () => {
      const vault = await setup()
      assert(!await vault.has("tests/null"))
      await vault.delete("tests/null")
      assert(!await vault.has("tests/null"))
    })
    test("delete existing secret", async () => {
      const vault = await setup()
      for (const [key] of Object.entries(secrets)) {
        assert(await vault.has(key))
        await vault.delete(key)
        assert(!await vault.has(key))
      }
    })
  })
}
await suite.conclude()
