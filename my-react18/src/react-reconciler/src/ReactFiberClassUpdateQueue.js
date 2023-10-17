/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 15:17:53
 * @Description: 
 */

import {
    markUpdateLaneFromFiberToRoot,
} from './ReactFiberConcurrentUpdates';

export const UpdateState = 0;
export function initializeUpdateQueue (fiber) {
    const queue = {
        shared: {
            pending: null
        }
    }
    fiber.updateQueue = queue
}

export function createUpdate () {
    const update = { tag: UpdateState}
    return update
}

/**
 * 进入更新队列
 * @param {*} fiber 
 * @param {*} update 
 * @returns 
 */
export function enqueueUpdate (fiber, update) {
    const updateQueue = fiber.updateQueue;
    const sharedQueue = updateQueue.shared;
    const pending = sharedQueue.pending;
    // 没有等待执行的fiber
    if (pending === null) {
        // This is the first update. Create a circular list.
        // 第一次更新，创建一个循环列表
        update.next = update;
    } else {
        update.next = pending.next;
        pending.next = update;
    }
    updateQueue.shared.pending = update;
    return markUpdateLaneFromFiberToRoot(fiber);
}

function getStateFromUpdate (update, prevState) {
    switch (update.tag) {
        case UpdateState:
            const payload = update.payload;
            let partialState = payload
            return Object.assign({}, prevState, partialState);
        default:
            return prevState 
    }
}

export function processUpdateQueue (workInProgress) {
    const queue = workInProgress.updateQueue
    const pendingQueue = queue.shared.pending
    if (pendingQueue != null) {
        queue.shared.pending = null
        const lastPendingUpdate = pendingQueue;
        const firstPendingUpdate = lastPendingUpdate.next;
        lastPendingUpdate.next = null;
        let newState = workInProgress.memoizedState
        let update = firstPendingUpdate
        while (update) {
            newState = getStateFromUpdate(update, newState)
            update = update.next
        }
        workInProgress.memoizedState = newState
    }
}