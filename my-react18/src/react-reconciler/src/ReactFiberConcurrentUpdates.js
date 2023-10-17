/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 15:30:43
 * @Description:
 */

import { HostRoot } from "./ReactWorkTags";

const concurrentQueues = [];
let concurrentQueuesIndex = 0;

export function markUpdateLaneFromFiberToRoot(sourceFiber) {
  let parent = sourceFiber.return;
  let node = sourceFiber;
  while (parent != null) {
    node = parent;
    parent = parent.return;
  }
  if (node.tag === HostRoot) {
    const root = node.stateNode;
    return root;
  }
  return null;
}

export function enqueueConcurrentHookUpdate(fiber, queue, update) {
  enqueueUpdate(fiber, queue, update);
  return getRootForUpdatedFiber(fiber);
}

function enqueueUpdate(fiber, queue, update) {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
}

function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;
  while (parent != null) {
    node = parent;
    parent = node.return;
  }
  return node.tag === HostRoot ? node.stateNode : null;
}

export function finishQueueingConcurrentUpdates() {
  const endIndex = concurrentQueuesIndex;
  concurrentQueuesIndex = 0;

  let i = 0;
  while (i < endIndex) {
    const fiber = concurrentQueues[i++];
    const queue = concurrentQueues[i++];
    const update = concurrentQueues[i++];

    if (queue != null && update != null) {
      const pending = queue.pending;
      if (pending == null) {
        // This is the first update. Create a circular list.
        update.next = update;
      } else {
        update.next = pending.next;
        pending.next = update;
      }
      queue.pending = update;
    }
  }
}
