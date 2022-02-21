
type x = {
  emit?: string|string[]
  listen?: string | string[]

  retry?: number | {
    attempts?:number
    interval?:number
    until?:...
  }
  
  if?:...
  
  
}