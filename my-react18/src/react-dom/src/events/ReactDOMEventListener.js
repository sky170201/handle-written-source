/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 16:15:20
 * @Description: 
 */
import { getClosestInstanceFromNode } from '../client/ReactDOMComponentTree';
import { dispatchEventForPluginEventSystem } from './DOMPluginEventSystem';
import getEventTarget from './getEventTarget';

export function createEventListenerWrapperWithPriority (targetContainer, domEventName, eventSystemFlags) {
    const listenerWrapper = dispatchDiscreteEvent
    return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer)
}

function dispatchDiscreteEvent (domEventName, eventSystemFlags, container, nativeEvent) {
    dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
}

export function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    const nativeEventTarget = getEventTarget(nativeEvent);
    // 从当前节点找到最近的DOM实例
    let targetInst = getClosestInstanceFromNode(nativeEventTarget);
    dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer)
}