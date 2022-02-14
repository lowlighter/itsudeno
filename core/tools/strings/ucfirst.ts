/** Set first letter to uppercase */
export function ucfirst(string: string) {
    return `${string.charAt(0).toLocaleUpperCase()}${string.substring(1)}`
  }