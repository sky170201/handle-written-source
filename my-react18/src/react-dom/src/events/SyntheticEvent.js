/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 17:32:53
 * @Description: 
 */

function functionThatReturnsTrue() {
    return true;
}
  
function functionThatReturnsFalse() {
    return false;
}

function createSyntheticEvent(Interface) {
    function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
        this._reactName = reactName;
        this._targetInst = targetInst;
        this.type = reactEventType;
        this.nativeEvent = nativeEvent;
        this.target = nativeEventTarget;
        this.currentTarget = null;

        for (const propName in Interface) {
            if (!Interface.hasOwnProperty(propName)) {
              continue;
            }
            this[propName] = nativeEvent[propName];
        }
        
        this.isDefaultPrevented = functionThatReturnsFalse;
        this.isPropagationStopped = functionThatReturnsFalse;
        return this;
    }
    
    Object.assign(SyntheticBaseEvent.prototype, {
        preventDefault() {
            const event = this.nativeEvent;
            if (!event) {
                return;
            }
        
            if (event.preventDefault) {
                event.preventDefault();
                // $FlowFixMe - flow is not aware of `unknown` in IE
            } else if (typeof event.returnValue !== 'unknown') {
                event.returnValue = false;
            }
            this.isDefaultPrevented = functionThatReturnsTrue;
        },
        stopPropagation() {
            const event = this.nativeEvent;
            if (!event) {
              return;
            }
      
            if (event.stopPropagation) {
              event.stopPropagation();
              // $FlowFixMe - flow is not aware of `unknown` in IE
            } else if (typeof event.cancelBubble !== 'unknown') {
              event.cancelBubble = true;
            }
      
            this.isPropagationStopped = functionThatReturnsTrue;
        },
    })

    return SyntheticBaseEvent

}

const MouseEventInterface = {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
}
export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);