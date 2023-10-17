/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 16:14:31
 * @Description: 
 */

export function addEventCaptureListener (target, eventType, listener) {
    target.addEventListener(eventType, listener, true);
    return listener;
}

export function addEventBubbleListener (target, eventType, listener) {
    target.addEventListener(eventType, listener, false);
    return listener;
}