/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 15:17:04
 * @Description: 
 */
import { registerSimpleEvents, topLevelEventsToReactNames } from '../DOMEventProperties';
import { accumulateSinglePhaseListeners } from '../DOMPluginEventSystem';
import { IS_CAPTURE_PHASE } from '../EventSystemFlags';
import { SyntheticMouseEvent } from '../SyntheticEvent';

function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
    
  const reactName = topLevelEventsToReactNames.get(domEventName);
  let reactEventType = domEventName;
  let SyntheticEventCtor;
  switch (domEventName) {
    case 'click':
        SyntheticEventCtor = SyntheticMouseEvent;
        break;
    default:
        break;
  }
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  const listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, inCapturePhase)
  if (listeners.length > 0) {
    // Intentionally create event lazily.
    const event = new SyntheticEventCtor(
      reactName,
      reactEventType,
      null,
      nativeEvent,
      nativeEventTarget,
    );
    dispatchQueue.push({event, listeners});
  }
}

export { registerSimpleEvents as registerEvents, extractEvents };