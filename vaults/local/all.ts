//Imports
import {Vault} from "@generated/vaults/local/it.ts"
import type {raw} from "@generated/vaults/local/it.ts"
import {Logger} from "@tools/log"
import {decode} from "std/encoding/hex.ts"
import Datastore from "x/dndb@0.3.3/mod.ts"
import {AES} from "x/god_crypto@v1.4.10/aes.ts"
import {ItsudenoError} from "@errors"
import type {primitive, uninitialized} from "@types"
const log = new Logger(import.meta.url)

/** Generic implementation */
Vault.register(
  import.meta.url,
  class extends Vault {
    /** Perform async initialization */
    async async(raw: raw) {
      const {key, path} = await this.prevalidate(raw)
      this.#vault = new Datastore({filename: path, autoload: true})
      this.#crypto = new AES(key)
      return super.async()
    }

    /** Check if a secret exists */
    async has(key: string) {
      await this.ready
      const k = await this.#encrypt(key)
      return await this.#vault.findOne({k}) ? true : false
    }

    /** Secrets getter */
    async get(key: string) {
      await this.ready
      if (!await this.has(key))
        throw new ItsudenoError.Vault(`unknown secret: ${key}`)
      const k = await this.#encrypt(key)
      const v = (await this.#vault.findOne({k}) as {v: string}).v
      return JSON.parse(await this.#decrypt(v))
    }

    /** Crypt a secret and store updated value */
    async set(key: string, value: primitive) {
      await this.ready
      const k = await this.#encrypt(key)
      const v = await this.#encrypt(JSON.stringify(value))
      if (await this.has(key)) {
        log.vv(`updating secret: ${key}`)
        await this.#vault.updateOne({k}, {$set: {v}})
      }
      else {
        log.vv(`creating secret: ${key}`)
        await this.#vault.insert({k, v})
      }
      return this
    }

    /** Delete a secret */
    async delete(key: string) {
      await this.ready
      const k = await this.#encrypt(key)
      log.vv(`deleting secret: ${key}`)
      await this.#vault.removeOne({k})
      return this
    }

    /** List secrets */
    async list() {
      await this.ready
      const ks = (await this.#vault.find({}, {k: 1}) as Array<{k: string}>)
        .map(({k}) => this.#decrypt(k))
      return (await Promise.all(ks)).sort()
    }

    /** Local vault */
    #vault = null as uninitialized as Datastore

    /** Crypto instance */
    #crypto = null as uninitialized as AES

    /** Encrypter */
    async #encrypt(value: string) {
      return (await this.#crypto.encrypt(value)).hex()
    }

    /** Decrypt a secret */
    async #decrypt(value: string) {
      return new TextDecoder().decode(
        await this.#crypto.decrypt(decode(new TextEncoder().encode(value))),
      )
    }
  },
)
