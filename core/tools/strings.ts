//Imports
import {ItsudenoError} from "@errors"

/** Set first letter to uppercase */
export function ucfirst(string: string) {
  return `${string.charAt(0).toLocaleUpperCase()}${string.substring(1)}`
}

/** Set first letter to lowercase */
export function lcfirst(string: string) {
  return `${string.charAt(0).toLocaleLowerCase()}${string.substring(1)}`
}

/** Change string case */
export function strcase(string: string, {from, to}: {from: string, to: string}) {
  //Separators
  const separators = {snake: "_", kebab: "-", dot: ".", slash: "/"}

  //Parse identifier
  let parts = []
  switch (from) {
    case "snake":
    case "dot":
    case "kebab":
      parts.push(...string.split(separators[from as keyof typeof separators]))
      break
    case "slash":
      parts.push(...string.split(/[\\/]/g))
      break
    case "pascal":
    case "camel":
      parts.push(...string.split(/(?=[A-Z])/g).map(lcfirst))
      break
    case "flat":
    default:
      throw new ItsudenoError.Unsupported(`unsupported string case conversion: ${from} → ${to}`)
  }

  //Rebuild identifier
  parts = parts.filter(part => part)
  switch (to) {
    case "snake":
    case "dot":
    case "kebab":
    case "slash":
      return parts.join(separators[to as keyof typeof separators])
    case "pascal":
      return parts.map(ucfirst).join("")
    case "camel":
      return [...parts.slice(0, 1).map(lcfirst), ...parts.slice(1).map(ucfirst)].join("")
    case "flat":
      return parts.join("").toLocaleLowerCase()
    default:
      throw new ItsudenoError.Unsupported(`unsupported string case conversion: ${from} → ${to}`)
  }
}
