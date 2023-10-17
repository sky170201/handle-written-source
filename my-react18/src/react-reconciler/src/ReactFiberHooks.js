/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-10 11:43:29
 * @Description: 
 */
import { enqueueConcurrentHookUpdate } from './ReactFiberConcurrentUpdates.js'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import ReactSharedInternals from "shared/ReactSharedInternals";
import is from 'shared/objectIs'

const { ReactCurrentDispatcher } = ReactSharedInternals;

let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;

function basicStateReducer(state, action) {
    // $FlowFixMe: Flow doesn't like mixed types
    return typeof action === 'function' ? action(state) : action;
}

function mountWorkInProgressHook () {
    const hook = {
        memoizedState: null,
        queue: null,
        next: null
    };
    if (workInProgressHook == null) {
        currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    } else {
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}

function updateWorkInProgressHook() {
    if (currentHook == null) {
        const current = currentlyRenderingFiber.alternate;
        currentHook = current.memoizedState;
    } else {
        currentHook = currentHook.next;
    }
    const newHook = {
        memoizedState: currentHook.memoizedState,
        queue: currentHook.queue,
        next: null,
    };
    if (workInProgressHook == null) {
        currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
        workInProgressHook = workInProgressHook.next = newHook;
    }
    return workInProgressHook;
}

function dispatchReducerAction (fiber, queue, action) {
    const update = {
        action,
        next: null
    };
    const root = enqueueConcurrentHookUpdate(fiber, queue, update);
    // 调用setState后，触发下一次事件循环，更新fiber树
    scheduleUpdateOnFiber(root, fiber);
}

// 初次渲染时的hook集合
const HooksDispatcherOnMountInDEV = {
    useReducer: mountReducer,
    useState: mountState,
}

function mountReducer (reducer, initialArg, init) {
    const hook = mountWorkInProgressHook();
    hook.memoizedState = initialArg;
    const queue = {
        pending: null,
        dispatch: null,
    };
    hook.queue = queue;
    const dispatch = queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, queue);
    return [hook.memoizedState, dispatch];
}

function mountState(initialState) {
    const hook = mountWorkInProgressHook();
    hook.memoizedState = hook.baseState = initialState;
    const queue = {
      pending: null,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: initialState,
    };
    hook.queue = queue;
    const dispatch = (queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue));
    return [hook.memoizedState, dispatch];
}

function dispatchSetState (fiber, queue, action) {
    const update = {
      action,
      hasEagerState: false,
      eagerState: null,
      next: null,
    };
  
    const lastRenderedReducer = queue.lastRenderedReducer;
    const currentState = queue.lastRenderedState;
    const eagerState = lastRenderedReducer(currentState, action);
    update.hasEagerState = true;
    update.eagerState = eagerState;
    if (is(eagerState, currentState)) {
        return;
    }
  
    const root = enqueueConcurrentHookUpdate(fiber, queue, update);
    scheduleUpdateOnFiber(root, fiber);
}

// 更新的hook集合
const HooksDispatcherOnUpdateInDEV = {
    useReducer: updateReducer,
    useState: updateState
}

function updateReducer (reducer) {
    const hook = updateWorkInProgressHook();
    const queue = hook.queue;
    queue.lastRenderedReducer = reducer;
    const current = currentHook;
    const pendingQueue = queue.pending;
    let newState = current.memoizedState;
    if (pendingQueue != null) {
        queue.pending = null;
        const first = pendingQueue.next;
        let update = first;
        do {
            if (update.hasEagerState) {
                newState = update.eagerState;
            } else {
                const action = update.action;
                newState = reducer(newState, action);
            }
            update = update.next;
        } while (update != null && update != first);
    }
    hook.memoizedState = queue.lastRenderedState = newState;
    return [hook.memoizedState, queue.dispatch];
}

function updateState(initialState) {
    return updateReducer(basicStateReducer, initialState);
  }

export function renderWithHooks (current, workInProgress, Component, props) {
    currentlyRenderingFiber = workInProgress;
    if (current != null && current.memoizedState != null) {
        ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
    } else {
        ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
    }
    const children = Component(props);
    currentlyRenderingFiber = null;
    workInProgressHook = null;
    currentHook = null;
    return children
}