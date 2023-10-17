/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 15:09:11
 * @Description: 
 */

export const allNativeEvents = new Set();

/**
 * 注册两个阶段的事件
 * @param {*} registrationName 注册事件名
 * @param {*} dependencies 
 */
export function registerTwoPhaseEvent(registrationName, dependencies) {
    registerDirectEvent(registrationName, dependencies);
    registerDirectEvent(registrationName + 'Capture', dependencies);
}

export function registerDirectEvent(registrationName, dependencies) {
    for (let i = 0; i < dependencies.length; i++) {
        allNativeEvents.add(dependencies[i]);
    }
}