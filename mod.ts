/**
 * GNU General Public License v3.0
 * Copyright (c) 2021-present Simon Lecoq (lowlighter)
 */
import {it} from "@core/setup"
export {it}
if (import.meta.main)
  await it.cli(Deno.args)
