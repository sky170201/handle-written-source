/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 10:42:54
 * @Description: 
 */

import {
    createRoot as createRootImpl,
} from './ReactDOMRoot';

function createRoot (container, options) {
    return createRootImpl(container, options);
}

export {
    createRoot
}