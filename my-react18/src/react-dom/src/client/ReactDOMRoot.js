/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 10:45:35
 * @Description: 
 */
import {
    createContainer,
    updateContainer,
} from 'react-reconciler/src/ReactFiberReconciler';
import {
  markContainerAsRoot,
} from './ReactDOMComponentTree';
import {ConcurrentRoot} from 'react-reconciler/src/ReactRootTags';
import { listenToAllSupportedEvents } from '../events/DOMPluginEventSystem';

const defaultOnRecoverableError =
  typeof reportError === 'function'
    ? reportError
    : (error) => {
        console['error'](error);
      };

let isStrictMode = false;
let concurrentUpdatesByDefaultOverride = false;
let identifierPrefix = '';
let onRecoverableError = defaultOnRecoverableError;
let transitionCallbacks = null;

function ReactDOMRoot(internalRoot) {
    this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function(children) {
    const root = this._internalRoot;
    root.containerInfo.innerHTML = ''
    updateContainer(children, root);
};

export function createRoot(container, options) {
    const root = createContainer(container);
    // 监听所有支持的事件
    listenToAllSupportedEvents(container);
    return new ReactDOMRoot(root);
}