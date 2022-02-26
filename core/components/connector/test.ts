// Imports
import { assert, assertMatch, assertStrictEquals, assertObjectMatch, ItsudenoError, Suite, TestTracer, assertRejects } from "../../testing/mod.ts"
import type { test } from "../../testing/mod.ts"
import { Connector, type handle } from "./mod.ts"
import type {permissions} from "./mod.ts"
import {exec} from "../../tools/exec/mod.ts"
import type { Escalation } from "../escalation/escalation.ts"

// Tests
await new Suite(import.meta.url).group("connector", async test => {
  class TestConnector extends Connector {
    async handle({escalation, command}:handle) {
      return [escalation?.handle(command), command].filter(prompt => prompt)
    }
    shell = function (prompt:string[]) {
      return prompt
    } as test
    async test(payload:string, {escalation, permissions}:{escalation?:Escalation, permissions?:permissions} = {}) {
      const prompts = (await this.exec(payload, {escalation:escalation ?? null as test, permissions})) as unknown as string[]
      return prompts
    }
  }

	const connector = await new TestConnector(import.meta.url, "test").ready
	test(".meta", () => assertStrictEquals((connector as test).meta, import.meta.url))
	test(".module", () => assertStrictEquals(connector.module, "core/components/connector"))
	test(".id", () => assertStrictEquals(connector.id, "test"))
	test(".ready", () => assertStrictEquals(connector.ready.state, "fulfilled"))
	test(".toString()", () => assertStrictEquals(`${connector}`, "[test TestConnector]"))
	test(".definition", () => assertStrictEquals(typeof connector.definition, "object"))

  test("#deno()", async () => {
    for (const [permissions, match] of [
      [{all:true}, / --allow-all /],
      [{hrtime:true, plugin:true}, / --allow-hrtime --allow-plugin /],
      [{read:true, write:true, net:true, ffi:true}, / --allow-read --allow-write --allow-net --allow-ffi /],
      [{read:["foo.ts", "bar.ts"]}, / --allow-read=foo\.ts,bar\.ts /],
      [{write:["foo.ts", "bar.ts"]}, / --allow-write=foo\.ts,bar\.ts /],
      [{net:["https://foo.net", "https://bar.net"]}, / --allow-net=https:\/\/foo\.net,https:\/\/bar\.net /],
      [{ffi:["foo.so", "bar.so"]}, / --allow-ffi=foo\.so,bar\.so /],
      [{run:true, env:true}, / --allow-run --allow-env /],
    ] as Array<[permissions, RegExp]>) {
      const [prompt] = await connector.test("", {permissions})
      assertMatch(prompt, match)
    }
  })

  test("#bundle()", async () => {
    for (const [payload, expected] of [
      ['console.log("Welcome to Itsudeno 🍣!")', {success:true, stdout:"Welcome to Itsudeno 🍣!\n"}],
      ['import "@it/core/testing/welcome.ts"', {success:true, stdout:"Welcome to Itsudeno 🍣!\n"}],
      ['import "https://deno.land/std/examples/welcome.ts"', {success:true, stdout:"Welcome to Deno!\n"}],
    ] as Array<[string, test]>) {
      const [prompt] = await connector.test(payload)
      assertObjectMatch(await exec(prompt), expected)
    }
  })
	
  test("#bundle() throws ItsudenoError.Connector", async () => {
    const tracer = await new TestTracer().ready
    const connector = Object.assign(await new TestConnector(import.meta.url, "test").ready, {context:{vars:{it:{tracer}}}})
    await assertRejects(() => connector.test("<invalid>"), ItsudenoError.Connector, "failed to prepare payload")
    {
      const emit = Deno.emit
      Deno.emit = () => ({files:{}} as test)
      await assertRejects(() => connector.test("<invalid>"), ItsudenoError.Connector, "unexpected error")
      Deno.emit = emit
    }
    assert(tracer.handled.size > 0)
  })

}).conclude()
