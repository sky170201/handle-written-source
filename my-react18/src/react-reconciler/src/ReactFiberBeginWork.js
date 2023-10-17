/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 16:31:52
 * @Description: 
 */

import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import {
  mountChildFibers,
  reconcileChildFibers,
} from './ReactChildFiber';
import { FunctionComponent, HostComponent, HostRoot, HostText, IndeterminateComponent } from "./ReactWorkTags";
import {
  shouldSetTextContent,
} from 'react-dom/src/client/ReactDOMHostConfig';
import {
  renderWithHooks,
} from './ReactFiberHooks';

function reconcileChildren(current, workInProgress, nextChildren) {
    if (current === null) {
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
    } else {
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren)
    }
}

function updateHostRoot(current, workInProgress) {
  processUpdateQueue(workInProgress);
  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

function updateHostComponent(current, workInProgress) {
    const { type } = workInProgress;
    const nextProps = workInProgress.pendingProps;
    let nextChildren = nextProps.children;
    const isDirectTextChild = shouldSetTextContent(type, nextProps);
    if (isDirectTextChild) {
        nextChildren = null;
    }
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

function mountIndeterminateComponent (current,workInProgress, Component) {
  const props = workInProgress.pendingProps;
  const value = renderWithHooks(null, workInProgress, Component, props)
  workInProgress.tag = FunctionComponent
  reconcileChildren(null, workInProgress, value)
  return workInProgress.child
}

/**
 * 更新函数组件
 * @param {*} current 
 * @param {*} workInProgress 
 * @param {*} Component 
 * @param {*} nextProps 
 */
function updateFunctionComponent (current, workInProgress, Component, nextProps) {
    const nextChildren = renderWithHooks(current, workInProgress, Component, nextProps);
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

/**
 * 开始遍历每个fiber工作单元
 * @param {*} current 
 * @param {*} workInProgress 
 * @returns 
 */
export function beginWork (current, workInProgress) {
    // console.log('workInProgress', workInProgress)
    switch (workInProgress.tag) {
        case IndeterminateComponent:
            return mountIndeterminateComponent(current,workInProgress, workInProgress.type);
        case FunctionComponent: {
            const Component = workInProgress.type;
            const resolvedProps = workInProgress.pendingProps;
            return updateFunctionComponent(current, workInProgress, Component, resolvedProps);
        }
        case HostRoot: 
            return updateHostRoot(current, workInProgress);
        case HostComponent: 
            return updateHostComponent(current, workInProgress);
        case HostText:
            // return updateHostText(current, workInProgress);
        default:
            return null
    }
}