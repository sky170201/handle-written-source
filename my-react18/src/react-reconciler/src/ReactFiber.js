/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 15:09:33
 * @Description:
 */
import {
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";

function FiberNode(tag, pendingProps, key) {
  this.tag = tag;
  this.key = key;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;

  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;

  this.alternate = null;
}

const createFiber = function (tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key);
};

export function createHostRootFiber() {
  return createFiber(HostRoot, null, null);
}

// We use a double buffering pooling technique because we know that we'll
// only ever need at most two versions of a tree. We pool the "other" unused
// node that we're free to reuse. This is lazily created to avoid allocating
// extra objects for things that are never updated. It also allow us to
// reclaim the extra memory if needed.
// 我们需要使用双缓存池技术，因为我们知道一棵树最多只需要两个版本
// 我们将“其他”未使用的我们可以自由重用的节点
// 这是延迟创建的，以避免分配从未更新的内容的额外对象。它还允许我们如果需要，回收额外的内存
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
  }
  
  workInProgress.flags = current.flags;

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  return workInProgress;
}

/**
 * 根据类型和属性创建fiber节点
 * @param {*} type 
 * @param {*} key 
 * @param {*} pendingProps 
 * @returns 当前新创建的fiber节点
 */
export function createFiberFromTypeAndProps(type, key, pendingProps) {
  // 默认是IndeterminateComponent， 标识函数组件或类组件
  let fiberTag = IndeterminateComponent;
  if (typeof type === "string") {
    fiberTag = HostComponent;
  }
  const fiber = createFiber(fiberTag, pendingProps, key);
  fiber.type = type;
  return fiber;
}

/**
 * 根据元素创建fiber节点
 * @param {*} element 
 * @returns 当前元素对应的fiber节点
 */
export function createFiberFromElement(element) {
  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;
  const fiber = createFiberFromTypeAndProps(type, key, pendingProps);
  return fiber;
}

/**
 * 根据文本创建fiber节点
 * @param {*} content 
 * @returns 当前文本对应的fiber节点
 */
export function createFiberFromText(content) {
  const fiber = createFiber(HostText, content, null);
  return fiber;
}
