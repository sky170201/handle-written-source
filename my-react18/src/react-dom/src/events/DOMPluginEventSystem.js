/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 15:07:16
 * @Description: 
 */
/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 15:07:16
 * @Description: 
 */
import { HostComponent } from 'react-reconciler/src/ReactWorkTags';
import { addEventBubbleListener, addEventCaptureListener } from './EventListener';
import { allNativeEvents } from './EventRegistry';
import { IS_CAPTURE_PHASE } from './EventSystemFlags';
import getEventTarget from './getEventTarget';
import { getListener } from './getListener';
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin'
import { createEventListenerWrapperWithPriority } from './ReactDOMEventListener';

SimpleEventPlugin.registerEvents();
const listeningMarker =
  '_reactListening' +
  Math.random()
    .toString(36)
    .slice(2);
export function listenToAllSupportedEvents (rootContainerElement) {
    if (!rootContainerElement[listeningMarker]) {
        rootContainerElement[listeningMarker] = true;
        allNativeEvents.forEach(domEventName => {
            // 监听原生捕获事件 true
            listenToNativeEvent(domEventName, true, rootContainerElement);
            // 监听原生冒泡事件 false
            listenToNativeEvent(domEventName, false, rootContainerElement);
        })
    }
}

function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
    let eventSystemFlags = 0; // 冒泡=0, 捕获=4;
    if (isCapturePhaseListener) {
      eventSystemFlags |= IS_CAPTURE_PHASE;
    }
    addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
}

function addTrappedEventListener (targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
    const listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags)
    // 是否捕获阶段的监听
    if (isCapturePhaseListener) {
        // 添加捕获监听
        addEventCaptureListener(targetContainer, domEventName, listener)
    } else {
        // 添加冒泡监听
        addEventBubbleListener(targetContainer, domEventName, listener)
    }
}

export function dispatchEventForPluginEventSystem (domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
    dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer)
}

function dispatchEventsForPlugins (domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
    const nativeEventTarget = getEventTarget(nativeEvent);
    const dispatchQueue = [];
    extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer)
    // console.log('dispatchQueue', dispatchQueue)
    processDispatchQueue(dispatchQueue, eventSystemFlags);
}

export function processDispatchQueue(dispatchQueue, eventSystemFlags) {
    // 是否捕获阶段
    const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
    for (let i = 0; i < dispatchQueue.length; i++) {
        const {event, listeners} = dispatchQueue[i];
        processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
    }
}

function processDispatchQueueItemsInOrder(event, dispatchListeners, inCapturePhase) {
    if (inCapturePhase) {
      for (let i = dispatchListeners.length - 1; i >= 0; i--) {
        const {currentTarget, listener} = dispatchListeners[i];
        if (event.isPropagationStopped()) {
          return;
        }
        executeDispatch(event, listener, currentTarget);
      }
    } else {
      for (let i = 0; i < dispatchListeners.length; i++) {
        const {currentTarget, listener} = dispatchListeners[i];
        if (event.isPropagationStopped()) {
          return;
        }
        executeDispatch(event, listener, currentTarget);
      }
    }
}

/**
 * 执行派发
 * @param {*} event 
 * @param {*} listener 
 * @param {*} currentTarget 
 */
function executeDispatch (event, listener, currentTarget) {
    event.currentTarget = currentTarget;
    listener(event)
    event.currentTarget = null;
}

/**
 * 添加事件队列
 * @param {*} dispatchQueue 
 * @param {*} domEventName 
 * @param {*} targetInst 
 * @param {*} nativeEvent 
 * @param {*} nativeEventTarget 
 * @param {*} eventSystemFlags 
 * @param {*} targetContainer 
 */
function extractEvents (dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
    SimpleEventPlugin.extractEvents(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
        targetContainer,
    );
}

/**
 * 积累单个阶段的监听事件
 * @param {*} targetFiber 
 * @param {*} reactName 
 * @param {*} nativeEventType 
 * @param {*} inCapturePhase 
 * @returns 
 */
export function accumulateSinglePhaseListeners(targetFiber, reactName, nativeEventType, inCapturePhase) {
    const captureName = reactName != null ? reactName + 'Capture' : null;
    const reactEventName = inCapturePhase ? captureName : reactName;
    const listeners = []

    let instance = targetFiber;
    while (instance != null) {
        const { stateNode, tag } = instance;
        if (tag === HostComponent && stateNode != null) {
            if (reactEventName != null) {
                const listener = getListener(instance, reactEventName);
                if (listener != null) {
                    listeners.push(createDispatchListener(instance, listener, stateNode));
                }
            }
        }
        instance = instance.return;
    }
    return listeners;
}

function createDispatchListener (instance, listener, currentTarget) {
    return {
        instance,
        listener,
        currentTarget
    }
}