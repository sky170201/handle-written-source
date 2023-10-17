/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 11:03:33
 * @Description: 
 */

import {createHostRootFiber} from './ReactFiber';
import {initializeUpdateQueue} from './ReactFiberClassUpdateQueue';

/**
 * 根fiber
 * @param {*} containerInfo 
 */
function FiberRootNode (containerInfo) {
    this.containerInfo = containerInfo;
}

/**
 * 创建根fiber
 * @param {*} containerInfo 真实DOM节点，根节点 div#root
 * @returns 
 */
export function createFiberRoot(containerInfo) {
    const root = new FiberRootNode(containerInfo)
    const uninitializedFiber = createHostRootFiber();
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;
    // 初始化更新队列，添加updateQueue属性，构建链表结构
    initializeUpdateQueue(uninitializedFiber);
    return root;
}