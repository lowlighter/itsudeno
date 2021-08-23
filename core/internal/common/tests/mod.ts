//Imports
import {Common} from "@core/internal/common/mod.ts"
import {delay} from "std/async/delay.ts"

/** Definition */
export const definition = {
  description: "test",
  args: {
    foo: {
      description: "foo",
      type: "boolean",
    },
    bar: {
      description: "bar",
      type: "boolean",
      default: false,
    },
  },
}

/** Test class */
export class InternalCommonTestsCore extends Common<typeof definition> {
  /** Constructor */
  constructor() {
    super({url: import.meta.url, definition})
  }

  /** Async constructor */
  protected async async() {
    await delay(1000)
    return super.async()
  }

  /** Arguments validator */
  async prevalidate<T>(args: T) {
    return await super.validate(args, this.definition.args, {strict: true})
  }

  /** Url */
  static readonly url = import.meta.url
}
