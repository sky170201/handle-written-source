import { isObject } from "@vue/shared";
import { reactive } from ".";
import { activeEffect, trackEffects, triggerEffects } from "./effect";

function toReactive(value) {
    return isObject(value) ? reactive(value) : value
}

class RefImpl {
    public _value
    public dep
    constructor(public rawValue, public _shallow) {
        this._value = _shallow ? rawValue : toReactive(rawValue) // 浅ref不需要再次代理
    }
    get value () {
        if (activeEffect) {
            trackEffects(this.dep || (this.dep = new Set)) // 收集依赖
        }
        return this._value
    }
    set value (newValue) {
        if (newValue !== this.rawValue) {
            this.rawValue = newValue
            this._value = this._shallow ? newValue : toReactive(newValue)
            triggerEffects(this.dep) // 触发更新
        }
    }
}

export function createRef(rawValue, shallow) {
    return new RefImpl(rawValue, shallow) // 将值进行包装
}

// 将原始类型包装成对象，同时也可以包装对象 进行深层代理
export function ref(value) {
    return createRef(value, false)
}

// 创建浅ref 不会进行深层代理
export function shallowRef(value) {
    return createRef(value, true);
}

class ObjectRefImpl {
    constructor(public _object, public _key) {}
    get value () {
        return this._object[this._key]
    }
    set value (newValue) {
        this._object[this._key] = newValue
    }
}

export function toRef(obj, key) { // 将响应式对象中的某个属性转化为ref
    return new ObjectRefImpl(obj, key)
}

export function toRefs(object) { // 将所有属性转换成ref
    const ret = Array.isArray(object) ? new Array(object.length) : {}
    for(const key in object) {
        ret[key] = toRef(object, key)
    }
    return ret
}

// 自动脱ref
export function proxyRefs(objectWithRefs){ // 代理的思想，如果是ref 则取ref.value
    return new Proxy(objectWithRefs,{
        get(target,key,receiver){
            let v = Reflect.get(target,key,receiver);
            return v.__v_isRef? v.value:v; 
        },
        set(target,key,value,receiver){ // 设置的时候如果是ref,则给ref.value赋值
            const oldValue = target[key];
            if(oldValue.__v_isRef){
                oldValue.value = value;
                return true
            }else{
                return Reflect.set(target,key,value,receiver)
            }
        }
    })
}