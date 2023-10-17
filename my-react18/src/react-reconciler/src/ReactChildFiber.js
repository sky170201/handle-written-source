/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 17:09:16
 * @Description: 
 */

import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import {
  createFiberFromElement,
  createFiberFromText,
  createWorkInProgress,
} from './ReactFiber';
import { Placement } from "./ReactFiberFlags";

function useFiber(fiber, pendingProps) {
  const clone = createWorkInProgress(fiber, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}

function ChildReconciler(shouldTrackSideEffects) {
    // 协调单个元素节点，构建父子fiber关系
    function reconcileSingleElement(returnFiber, currentFirstChild, element) {
        const key = element.key;
        let child = currentFirstChild;
        // DOM比对，如果key相同且type相同则返回之前的fiber
        while (child != null) {
          if (child.key === key) {
            const elementType = element.type;
            if (child.type === elementType) {
              const existing = useFiber(child, element.props);
              existing.return = returnFiber;
              return existing;
            } 
          }
          child = child.return;
        }
        // 否则创建新的fiber节点返回
        const created = createFiberFromElement(element);
        created.return = returnFiber;
        return created;
    }
    // 添加副作用
    function placeSingleChild(newFiber) {
        if (shouldTrackSideEffects && newFiber.alternate === null) {
          // 要在最后提交节点插入此节点
          // React渲染分为渲染render和提交commit两个阶段
          newFiber.flags |= Placement;
        }
        return newFiber;
    }
    // 协调单个文本节点，构建父子fiber关系
    function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent) {
        const created = createFiberFromText(textContent, returnFiber.mode, lanes);
        created.return = returnFiber;
        return created;
    }

    // 给数组儿子的每个fiber节点添加父子关系return
    function createChild (returnFiber, newChild) {
      if (
        (typeof newChild === 'string' && newChild !== '') ||
        typeof newChild === 'number'
      ) {
        const created = createFiberFromText(`${newChild}`)
        created.return = returnFiber
        return created
      }
      if (typeof newChild === 'object' && newChild != null) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE: {
            // 创建儿子fiber节点，构建父子关系，return > parent
            const created = createFiberFromElement(newChild)
            created.return = returnFiber
            return created
          }
          default:
            break;
        }
      }
      return null;
    }

    // 给数组儿子添加副作用
    function placeChild(newFiber, newIndex) {
      newFiber.index = newIndex
      if (shouldTrackSideEffects) newFiber.flags |= Placement
    }

    // 协调数组儿子，构建父子return及兄弟fiber节点结构
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
      let resultingFirstChild = null;
      let previousNewFiber = null;
      let newIdx = 0;
      let nextOldFiber = null;
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(returnFiber, newChildren[newIdx])
        if (newFiber === null) {
          continue
        }
        placeChild(newFiber, newIdx);
        // 遍历当前父fiber下的所有儿子，构建child -> sibling -> sibling -> ...  且所有节点的return指向父fiber
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber;
        } else {
          previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
      }
      
      return resultingFirstChild;
    }

    // 协调儿子fiber节点，返回大儿子fiber节点
    function reconcileChildFibers (returnFiber, currentFirstChild, newChild) {
        if (typeof newChild === 'object' && newChild != null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild))
                default:
                    break;
            }
            if (Array.isArray(newChild)) {
                return reconcileChildrenArray(returnFiber, currentFirstChild, newChild)
            }
        }
        if (typeof newChild === 'string') {
            return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, newChild))
        }
        return null;
    }

    return reconcileChildFibers
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);