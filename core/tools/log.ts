//Imports
import {esm} from "@tools/internal"
import {cyan, gray, magenta, red, yellow} from "std/fmt/colors.ts"

/** Log levels */
export const enum level {
  none = 0,
  error = 1,
  warn = 2,
  notice = 3,
  info = 4,
  v = 5,
  vv = 6,
  vvv = 7,
  vvvv = 8,
  all = 255,
}

/**
 * Logger
 *
 * A tagged console logger with colors
 */
export class Logger {
  /** Log level */
  static level = level.all

  /** Tag */
  readonly tag: string

  /** Constructor */
  constructor(url: string) {
    this.tag = `[${esm(url).substring(0, 22).padEnd(22)}]`
  }

  /** Format message */
  #format(color: colors, {args = [] as unknown[]}) {
    return [this.tag, ...args].map(arg => `${arg}`.trim()).filter(arg => arg).map(color)
  }

  /** Log errors */
  error(...args: unknown[]) {
    if (Logger.level >= level.error)
      console.error(...this.#format(red, {args}))
  }

  /** Log warnings */
  warn(...args: unknown[]) {
    if (Logger.level >= level.warn)
      console.warn(...this.#format(yellow, {args}))
  }

  /** Log notices */
  notice(...args: unknown[]) {
    if (Logger.level >= level.notice)
      console.info(...this.#format(magenta, {args}))
  }

  /** Log info */
  info(...args: unknown[]) {
    if (Logger.level >= level.info)
      console.info(...this.#format(cyan, {args}))
  }

  /** Verbose */
  v(...args: unknown[]) {
    if (Logger.level >= level.v)
      console.debug(...this.#format(gray, {args}))
  }

  /** Verbose (+) */
  vv(...args: unknown[]) {
    if (Logger.level >= level.vv)
      console.debug(...this.#format(gray, {args}))
  }

  /** Verbose (++) */
  vvv(...args: unknown[]) {
    if (Logger.level >= level.vvv)
      console.debug(...this.#format(gray, {args}))
  }

  /** Verbose (+++) */
  vvvv(...args: unknown[]) {
    if (Logger.level >= level.vvvv)
      console.debug(...this.#format(gray, {args}))
  }

  /** Byte */
  async byte(bytes: Uint8Array) {
    if (Logger.level >= level.vvvv)
      await Deno.stdout.write(bytes)
  }
}

/** Colors */
type colors = typeof cyan | typeof gray | typeof red | typeof yellow | typeof magenta
