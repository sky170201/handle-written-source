export function isObject(value: unknown) : value is Record<any,any> {
    return typeof value === 'object' && value !== null
}

export function isFunction(val: unknown): boolean {
    return typeof val === 'function'
}

export function isString(val: unknown): boolean {
    return typeof val === 'string'
}
export { ShapeFlags } from './shapeFlags'