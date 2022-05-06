
export let activeEffect = undefined // 当前正在执行的effect

function cleanupEffect(effect) {
    const { deps } = effect // 清理effect
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect)
    }
    effect.deps.length = 0
}

// 这里要注意的是：触发时会进行清理操作（清理effect），在重新进行收集（收集effect）。在循环过程中会导致死循环。

class ReactiveEffect{
    active = true
    deps = [] // 收集effect中使用到的属性
    parent = undefined
    constructor(public fn) {
        
    }
    run() {
        if (!this.active) { // 不是激活状态
            return this.fn()
        }
        try {
            this.parent = activeEffect // 当前的effect就是他的父亲
            activeEffect = this // 设置成正在激活的是当前effect
            cleanupEffect(this)
            return this.fn() // 先清理再运行
        } finally {
            activeEffect = this.parent // 执行完毕后还原activeEffect
            this.parent = undefined
        }
    }
    stop() {
        if (this.active) {
            cleanupEffect(this)
            this.active = false
        }
    }
}

export function effect (fn, options) {
    const _effect = new ReactiveEffect(fn) // 创建响应式effect
    _effect.run() // 让响应式effect默认执行

    const runner = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner // 返回runner
}

const targetMap = new WeakMap() // 记录依赖关系
export function track(target, type, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target)
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }
        let dep = depsMap.get(key)
        if (!dep) {
            depsMap.set(key, (dep = new Set())) // {target: {key: Set()}}
        }
        let shouldTrack = !dep.has(activeEffect)
        if (shouldTrack) {
            dep.add(activeEffect)
            activeEffect.deps.push(dep) // 让effect记住dep，这样后续可以用于清理
        }
    }
}

// 将属性和对应的effect维护成映射关系，后续属性变化可以触发对应的effect函数重新run

export function trigger(target, type, key?, newValue?, oldValue?) {
    const depsMap = targetMap.get(target) // 获取对应的映射表
    if (!depsMap) return
    let effects = depsMap.get(key)
    if (effects) {
        effects = new Set(effects);
        for (const effect of effects) {
            if (effect !== activeEffect) { 
                if(effect.scheduler){ // 如果有调度函数则执行调度函数
                    effect.scheduler()
                }else{
                    effect.run(); 
                }
            }
        }
    }
}