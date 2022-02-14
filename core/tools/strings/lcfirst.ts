/** Set first letter to lowercase */
export function lcfirst(string: string) {
    return `${string.charAt(0).toLocaleLowerCase()}${string.substring(1)}`
  }