/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 17:20:02
 * @Description:
 */

import { getFiberCurrentPropsFromNode } from "../client/ReactDOMComponentTree";

export function getListener(inst, registrationName) {
  const stateNode = inst.stateNode;
  if (stateNode === null) {
    // Work in progress (ex: onload events in incremental mode).
    return null;
  }
  const props = getFiberCurrentPropsFromNode(stateNode);
  if (props === null) {
    // Work in progress.
    return null;
  }
  const listener = props[registrationName];
  return listener;
}
