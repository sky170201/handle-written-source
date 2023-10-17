/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-06 14:59:20
 * @Description: 
 */
import { NoFlags, Update } from "./ReactFiberFlags";
import { appendInitialChild, createInstance, createTextInstance, finalizeInitialChildren, prepareUpdate } from "react-dom/src/client/ReactDOMHostConfig";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTags";

/**
 * 冒泡属性
 * 遍历当前fiber的子节点，将下面所有子节点及其子节点的副作用全部合并到自己的subtreeFlags上
 * @param {*} completedWork 
 */
function bubbleProperties(completedWork) {
    let subtreeFlags = NoFlags;
    let child = completedWork.child;
    while (child != null) {
        subtreeFlags |= child.subtreeFlags;
        subtreeFlags |= child.flags;
        child = child.sibling;
    }
    completedWork.subtreeFlags |= subtreeFlags;
}

function appendAllChildren (parent, workInProgress) {
    // 我们只创建了顶级fiber，所以需要递归其子节点查找所有终端节点
    let node = workInProgress.child;
    while (node != null) {
        // 如果是原生节点，直接添加到父节点上
        if (node.tag === HostComponent || node.tag === HostText) {
            appendInitialChild(parent, node.stateNode);
            // 再看看第一个节点是不是原生节点
        } else if (node.child != null) {
            // node.child.return = node;
            node = node.child;
            continue;
        }
        if (node === workInProgress) {
          return;
        }
        // 如果没有弟弟就找父亲的弟弟
        while (node.sibling === null) {
            // 如果找到了根节点或回到了原节点，则结束
          if (node.return === null || node.return === workInProgress) {
            return;
          }
          node = node.return;
        }
        // node.sibling.return = node.return;
        // 下一个弟弟节点
        node = node.sibling;
    }
}

/**
 * 给当前进行中的fiber节点标记Update副作用
 * @param {*} workInProgress 
 */
function markUpdate(workInProgress) {
    workInProgress.flags |= Update;
}

function updateHostComponent (current, workInProgress, type, newProps) {
    const oldProps = current.memoizedProps;
    const instance = workInProgress.stateNode;
    const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
    workInProgress.updateQueue = updatePayload;
    // 更新原生标签内容，如果有需要更新的队列，则标记为Update
    if (updatePayload) {
        markUpdate(workInProgress);
    }
}

/**
 * 完成工作单元，当前fiber节点下的所有子节点完成时才完成
 * 1?、创建真实DOM节点挂到stateNode属性
 * 2?、把子fiber节点的真实DOM挂到自己身上
 * 3?、设置初始化属性
 * 4、冒泡属性，合并副作用
 * @param {*} current 
 * @param {*} workInProgress 
 */
export function completeWork(current, workInProgress) {
    // 打印logger
    const newProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
        case HostComponent: {
            const type = workInProgress.type;
            if (current !== null && workInProgress.stateNode != null) {
                // 如果是更新走更新逻辑
                updateHostComponent(current, workInProgress, type, newProps);
            } else {
                // 如果是初始挂载走创建逻辑
                const instance = createInstance(type, newProps, workInProgress);
                appendAllChildren(instance, workInProgress);
                workInProgress.stateNode = instance;
                // 设置初始化属性
                finalizeInitialChildren(instance, type, newProps)
            }
            bubbleProperties(workInProgress);
            break;
        }
        case FunctionComponent:
            bubbleProperties(workInProgress);
            break;
        case HostRoot:
            bubbleProperties(workInProgress);
            break;
        case HostText: {
            const newText = newProps;
            workInProgress.stateNode = createTextInstance(newText)
            bubbleProperties(workInProgress);
            break;
        }
        default: 
            break;
    }

}