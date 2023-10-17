/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 15:43:03
 * @Description: 
 */
import { scheduleCallback } from 'Scheduler'
import {
    createWorkInProgress,
  } from './ReactFiber';
import { beginWork } from './ReactFiberBeginWork';
import { commitMutationEffects } from './ReactFiberCommitWork';
import {completeWork} from './ReactFiberCompleteWork';
import { finishQueueingConcurrentUpdates } from './ReactFiberConcurrentUpdates';
import { NoFlags, MutationMask } from './ReactFiberFlags';

let workInProgress = null;

/**
 * 计划更新root
 * @param {*} root 
 */
export function scheduleUpdateOnFiber(root) {
    // 确保调度执行root上的更新
    ensureRootIsScheduled(root);
}

function ensureRootIsScheduled (root) {
    scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}

function performConcurrentWorkOnRoot (root) {
    renderRootSync(root)
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    commitRoot(root)
}

/**
 * 提交阶段：判断自身是否有副作用或子孙节点有没有副作用
 * @param {*} root 
 */
function commitRoot (root) {
    // MutationMask 包括所有需要变更的副作用
    const finishedWork = root.finishedWork;
    const subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags
    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags
    if (subtreeHasEffects || rootHasEffect) {
        // console.log('commitRoot')
        commitMutationEffects(root, finishedWork)
    }
    root.current = finishedWork
}

function prepareFreshStack (root) {
    workInProgress = createWorkInProgress(root.current, null);
    finishQueueingConcurrentUpdates();
}

function renderRootSync (root) {
    prepareFreshStack(root);
    workLoopSync();
}

function workLoopSync () {
    while (workInProgress != null) {
        performUnitOfWork(workInProgress);
    }
}

function performUnitOfWork(unitOfWork) {
    const current = unitOfWork.alternate;
  
    // 主要是拿到下一个工作任务
    let next = beginWork(current, unitOfWork);
  
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    // 如果没有儿子了，则开始依次完成工作单元
    if (next === null) {
      completeUnitOfWork(unitOfWork);
    } else {
      workInProgress = next;
    }
}

// 完成执行单元
function completeUnitOfWork (unitOfWork) {
    // 为了完成当前工作单元，然后移动到下一个兄弟节点，如果没有兄弟节点，则返回到父fiber
    let completedWork = unitOfWork;
    do {
        const current = completedWork.alternate;
        const returnFiber = completedWork.return;
        completeWork(current, completedWork);
        const siblingFiber = completedWork.sibling;
        if (siblingFiber != null) {
            // 依次完成兄弟fiber节点
            workInProgress = siblingFiber;
            return;
        }
        // 得等所有兄弟fiber都完成了才能完成父fiber
        completedWork = returnFiber
        workInProgress = completedWork
    } while (completedWork != null)
}