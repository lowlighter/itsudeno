/** Escape string to be regex safe */
export function escape(pattern:string) {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
} 