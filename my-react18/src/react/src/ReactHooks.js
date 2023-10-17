/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-19 11:39:36
 * @Description: 
 */
import ReactCurrentDispatcher from "./ReactCurrentDispatcher";

function resolveDispatcher() {
    const dispatcher = ReactCurrentDispatcher.current;
    return dispatcher;
}

export function useReducer (reducer, initialArg, init) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useReducer(reducer, initialArg, init);
}

export function useState (initialState) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(initialState);
}