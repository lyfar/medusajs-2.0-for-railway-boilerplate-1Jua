export const isObject = (input: any) => input instanceof Object
export const isArray = (input: any) => Array.isArray(input)
export const isEmpty = (value: any): boolean => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  )
}
