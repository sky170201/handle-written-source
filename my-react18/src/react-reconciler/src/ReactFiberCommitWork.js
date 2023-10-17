/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-06 16:53:17
 * @Description:
 */

import { appendChild, insertBefore, appendChildToContainer, commitUpdate } from "react-dom/src/client/ReactDOMHostConfig";
import { MutationMask, Placement, Update } from "./ReactFiberFlags";
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTags";

export function commitMutationEffects(root, finishedWork) {
  commitMutationEffectsOnFiber(finishedWork, root);
}

function commitMutationEffectsOnFiber(finishedWork, root) {
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case HostRoot:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      break;
    case FunctionComponent:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      break;
    case HostComponent:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      // 如果有更新Update，则提交更新，包括DOM和Fiber更新
      if (flags & Update) {
        const instance = finishedWork.stateNode;
        if (instance != null) {
          // Commit the work prepared earlier.
          const newProps = finishedWork.memoizedProps;
          // For hydration we reuse the update path but we treat the oldProps
          // as the newProps. The updatePayload will contain the real change in
          // this case.
          const oldProps =
            current !== null ? current.memoizedProps : newProps;
          const type = finishedWork.type;
          // TODO: Type the updateQueue to be specific to host components.
          const updatePayload = finishedWork.updateQueue;
          finishedWork.updateQueue = null;
          if (updatePayload !== null) {
            commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork)
          }
        }
      }
      break;
    case HostText:
      recursivelyTraverseMutationEffects(root, finishedWork);
      commitReconciliationEffects(finishedWork);
      break;
    default:
      break;
  }
}

function recursivelyTraverseMutationEffects(root, parentFiber) {
  if (parentFiber.subtreeFlags & MutationMask) {
    let child = parentFiber.child;
    while (child != null) {
      commitMutationEffectsOnFiber(child, root);
      child = child.sibling;
    }
  }
}

function insertOrAppendPlacementNode(node, before, parent) {
  const { tag } = node;
  const isHost = tag === HostComponent || tag === HostText;
  if (isHost) {
    const stateNode = node.stateNode;
    if (before) {
      insertBefore(parent, stateNode, before);
    } else {
      appendChild(parent, stateNode);
    }
  } else {
    const child = node.child;
    if (child != null) {
      insertOrAppendPlacementNode(child, before, parent);
      let sibling = child.sibling;
      while (sibling != null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  const {tag} = node;
  const isHost = tag === HostComponent || tag === HostText;
  if (isHost) {
    const stateNode = node.stateNode;
    if (before) {
      insertInContainerBefore(parent, stateNode, before);
    } else {
      appendChildToContainer(parent, stateNode);
    }
  } else {
    const child = node.child;
    if (child != null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent);
      let sibling = child.sibling;
      while (sibling != null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

function getHostSibling(fiber) {
  let node = fiber;
  siblings: while (true) {
    // If we didn't find anything, let's try the next sibling.
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        // 如果我们是根Fiber或者父节点是原生节点，我们就是最后的sibling
        return null;
      }
      node = node.return;
    }
    //   node.sibling.return = node.return;
    node = node.sibling;
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // If 它 is not host node and, we might 在其中有 a host node.
      // Try to search down 直到 we find one.
      if (node.flags & Placement) {
        // If we don't have a child, try the siblings.
        continue siblings;
      } else {
        //   node.child.return = node;
        node = node.child;
      }
    }
    // 检查此原生节点是否稳定可以放置
    if (!(node.flags & Placement)) {
      // Found it!
      return node.stateNode;
    }
  }
}

function isHostParent(fiber) {
    return fiber.tag === HostComponent || fiber.tag === HostRoot
}

function getHostParentFiber(fiber) {
  let parent = fiber.return;
  while (parent != null) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
}

function commitPlacement(finishedWork) {
  const parentFiber = getHostParentFiber(finishedWork);
  switch (parentFiber.tag) {
    case HostComponent: {
      const parent = parentFiber.stateNode;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    }
    case HostRoot:
      const parent = parentFiber.stateNode.containerInfo;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      break;
    default:
      break;
  }
}

function commitReconciliationEffects(finishedWork) {
  const flags = finishedWork.flags;
  if (flags & Placement) {
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
}
