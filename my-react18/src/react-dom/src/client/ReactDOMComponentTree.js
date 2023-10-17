/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 11:10:12
 * @Description: 
 */

const randomKey = Math.random()
                    .toString(36)
                    .slice(2);
const internalContainerInstanceKey = '__reactContainer$' + randomKey;
const internalPropsKey = '__reactProps$' + randomKey;
const internalInstanceKey = '__reactFiber$' + randomKey;

export function markContainerAsRoot(hostRoot, node) {
    node[internalContainerInstanceKey] = hostRoot;
}

export function getClosestInstanceFromNode (targetNode) {
    const targetInst = targetNode[internalInstanceKey]
    if (targetInst) {
        return targetInst
    }
    return null
}

export function getFiberFromScopeInstance(scope) {
    return scope[internalInstanceKey] || null
}

export function getFiberCurrentPropsFromNode(node) {
    return node[internalPropsKey] || null
}

export function precacheFiberNode(hostInst, node) {
    node[internalInstanceKey] = hostInst;
}

export function updateFiberProps(node, props) {
    node[internalPropsKey] = props;
}