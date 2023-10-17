import { setInitialProperties, diffProperties, updateProperties } from "react-dom/src/client/ReactDOMComponent";
import { precacheFiberNode, updateFiberProps } from "./ReactDOMComponentTree";

/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-06 14:30:26
 * @Description: 
 */
export function shouldSetTextContent(type, props) {
  return (
    typeof props.children === 'string' || typeof props.children === 'number'
  );
}

export function appendInitialChild (parent, child) {
  parent.appendChild(child)
}

export function createInstance (type, props, internalInstanceHandle) {
  const domElement = document.createElement(type)
  precacheFiberNode(internalInstanceHandle, domElement)
  updateFiberProps(domElement, props)
  return domElement
}

export function createTextInstance (content) {
  return document.createTextNode(content)
}

/**
 * 设置初始化属性
 * @param {*} domElement 
 * @param {*} type 
 * @param {*} props 
 */
export function finalizeInitialChildren (domElement, type, props) {
  setInitialProperties(domElement, type, props);
}

export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child);
}

export function insertBefore(parentInstance, child, beforeChild) {
  parentInstance.insertBefore(child, beforeChild);
}

export function appendChildToContainer (container, child) {
  container.appendChild(child)
}

export function prepareUpdate(domElement, type, oldProps, newProps) {
  return diffProperties(domElement, type, oldProps, newProps)
}

export function commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
  updateProperties(domElement, updatePayload, type, oldProps, newProps);
  // Update the props handle so that we know which props are the ones with
  // with current event handlers.
  updateFiberProps(domElement, newProps);
}