/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 15:18:08
 * @Description: 
 */

import { registerTwoPhaseEvent } from "./EventRegistry";

export const topLevelEventsToReactNames = new Map();

const simpleEventPluginEvents = ['click']

function registerSimpleEvent(domEventName, reactName) {
    topLevelEventsToReactNames.set(domEventName, reactName);
    registerTwoPhaseEvent(reactName, [domEventName]);
}


export function registerSimpleEvents() {
    for (let i = 0; i < simpleEventPluginEvents.length; i++) {
        const eventName = simpleEventPluginEvents[i];
        const domEventName = eventName.toLowerCase();
        const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
        registerSimpleEvent(domEventName, 'on' + capitalizedEvent);
    }
}