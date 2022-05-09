import { isObject } from "@vue/shared";
import { activeEffect, track, trigger } from "./effect";

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}

const reactiveMap = new WeakMap(); // 缓存列表
const mutableHandlers: ProxyHandler<object> = {
    get (target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) { // 在get中增加标识，当获取IS_REACTIVE时返回true
            return true
        }
        // 等会谁来取值就做依赖收集
        const res = Reflect.get(target, key, receiver)
        track(target, 'get', key) // 依赖收集
        if(isObject(res)){
            return reactive(res);
        }
        return res
    },
    set (target, key, value, receiver) {
        // 等会赋值的时候可以重新触发effect执行
        let oldValue = target[key]
        const result = Reflect.set(target, key, value, receiver)
        if (oldValue !== value) {
            trigger(target, 'set', key, value, oldValue)
        }
        return result
    }
}

function createReactiveObject(target: object, isReadonly: boolean) {
    if (!isObject(target)) {
        return target
    }
    if (target[ReactiveFlags.IS_REACTIVE]) { // 在创建响应式对象前先进行取值，看是否已经是响应式对象
        return target
    }
    const exisitingProxy = reactiveMap.get(target) // 如果已经代理过则直接返回代理后的对象
    if (exisitingProxy) return exisitingProxy
    const proxy = new Proxy(target, mutableHandlers) // 对对象进行代理
    reactiveMap.set(target, proxy)
    return proxy
}


export function reactive(target: object) {
    return createReactiveObject(target, false)
}

/*
export function shallowReactive(target: object) {
    return createReactiveObject(target, false)
}
export function readonly(target: object) {
    return createReactiveObject(target, true)
}
export function shallowReadonly(target: object) {
    return createReactiveObject(target, true)
}
*/
