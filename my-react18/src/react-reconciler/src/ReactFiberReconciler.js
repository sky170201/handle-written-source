/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 10:52:07
 * @Description: 
 */
/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 10:52:07
 * @Description: 
 */
import {createFiberRoot} from './ReactFiberRoot';
import {
  createUpdate,
  enqueueUpdate,
} from './ReactFiberClassUpdateQueue';
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'

/**
 * 创建容器
 * @param {*} containerInfo 
 * @param {*} tag 
 * @param {*} hydrationCallbacks 
 * @param {*} isStrictMode 
 * @param {*} concurrentUpdatesByDefaultOverride 
 * @param {*} identifierPrefix 
 * @param {*} onRecoverableError 
 * @param {*} transitionCallbacks 
 * @returns 
 */
export function createContainer(
    containerInfo,
    tag,
    hydrationCallbacks,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
    identifierPrefix,
    onRecoverableError,
    transitionCallbacks,
  ) {
    const hydrate = false;
    const initialChildren = null;
    return createFiberRoot(
      containerInfo,
      tag,
      hydrate,
      initialChildren,
      hydrationCallbacks,
      isStrictMode,
      concurrentUpdatesByDefaultOverride,
      identifierPrefix,
      onRecoverableError,
      transitionCallbacks,
    );
}

/**
 * 更新容器
 * @param {*} element 
 * @param {*} container 
 */
export function updateContainer(element, container) {
    const current = container.current;
  
    const update = createUpdate();
    update.payload = {element};
  
    const root = enqueueUpdate(current, update);
    scheduleUpdateOnFiber(root);
    
    
}