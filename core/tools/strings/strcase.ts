//Imports
import {lcfirst} from "core/tools/strings/lcfirst.ts"
import {ucfirst} from "core/tools/strings/ucfirst.ts"
import { ItsudenoError } from "@errors"

//Separators
const separators = {snake: "_", kebab: "-", dot: ".", slash: "/"}

//From case
type fcase = keyof typeof separators | "pascal" | "camel"

//To case
type tcase = fcase | "flat" | "upper"

//camelsnake

//macro

/*
 NAMING-IDENTIFIER        | TRAIN-CASE, COBOL-CASE, SCREAMING-KEBAB-CASE                |
| Naming-Identifier        | Train-Case, HTTP-Header-Case                                |
| _namingIdentifier        | Undercore Notation (prefixed by "_" followed by camelCase
*/


/** Change string case */
export function strcase(string: string, {from, to}: {from: fcase, to: tcase}) {

  //
  if (["lower", "flat"].includes(to))
    return string.toLocaleLowerCase()
  //if ([""])

  //Parse identifier
  const parts = []
  switch (true) {
    case Object.keys(separators).includes(from):
      parts.push(...string.split(separators[from as keyof typeof separators]).filter(part => part))
      break
    case ["pascal", "camel"].includes(from):
      parts.push(...string.split(/(?=[A-Z])/g).filter(part => part).map(lcfirst))
      break
    default:
      throw new ItsudenoError.Unsupported(`unsupported string case conversion: ${from} → ${to}`)
  }

  //Rebuild identifier
  switch (true) {
    case Object.keys(separators).includes(to):
      return parts.join(separators[to as keyof typeof separators])
    case to === "pascal":
      return parts.map(ucfirst).join("")
    case to === "camel":
      return [...parts.slice(0, 1).map(lcfirst), ...parts.slice(1).map(ucfirst)].join("")

    case to === "upper":
      return parts.join("").toLocaleUpperCase()
    default:
      throw new ItsudenoError.Unsupported(`unsupported string case conversion: ${from} → ${to}`)
  }

}