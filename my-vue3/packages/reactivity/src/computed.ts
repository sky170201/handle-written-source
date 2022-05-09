import { isFunction } from "@vue/shared";
import { activeEffect, ReactiveEffect, trackEffects, triggerEffects } from "./effect";

class ComputedRefImpl {
    public effect
    public _value
    public dep
    public _dirty = true
    constructor(getter, public setter) {
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) { // 依赖的值变化更新dirty并触发更新，不是重新计算，而且当后面需要调用这个计算属性的值时才重新计算
                this._dirty = true
                triggerEffects(this.dep)
            }
        })  
    }
    get value() { // 取值的时候进行依赖收集
        if (activeEffect) {
            trackEffects(this.dep || (this.dep = new Set))
        }
        if (this._dirty) { // 如果是脏值，执行函数
            this._dirty = false
            this._value = this.effect.run()
        }
        return this._value
    }
    set value(newValue) {
        this.setter(newValue)
    }
}

export function computed(getterOrOptions) {
    const onlyGetter = isFunction(getterOrOptions)
    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions
        setter = () => {}
    } else {
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    }
    // 创建计算属性
    return new ComputedRefImpl(getter, setter)
}