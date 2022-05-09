import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { ReactiveFlags } from "./reactive";

function traverse(value, seen = new Set) {
    if (!isObject(value)) {
        return value
    }
    if (seen.has(value)) {
        return value
    }
    seen.add(value);
    for(const k in value){ // 递归访问属性用于依赖收集
        traverse(value[k],seen)
    }
    return value
}

export function isReactive(value){
    return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

export function watch(source, cb, {immediate} = {} as any) {
    let getter;
    if (isReactive(source)) { // 如果是响应式对象
        getter = () => traverse(source) // 包装成effect对应的fn，函数内部进行遍历达到依赖收集的目的
    } else if (isFunction(source)) {
        getter = source
    }
    let oldValue;
    // 连续触发watch时需要清理之前的watch操作
    let cleanup
    let onCleanup = (fn) => {
        cleanup = fn
    }
    const job = () => {
        const newValue = effect.run() // 值变化时再次运行effect函数，获取新值
        if (cleanup) cleanup()
        cb(newValue, oldValue, onCleanup)
        oldValue = newValue
    }
    const effect = new ReactiveEffect(getter, job) // 创建effect
    if (immediate) {
        job()
    }
    oldValue = effect.run() // 运行保存老值
}
