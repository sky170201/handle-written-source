/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-06 16:13:18
 * @Description: 
 */

// 给节点设置属性
export function setValueForProperty (node, name, value) {
    if (value === null) {
        node.removeAttribute(name)
    } else {
        node.setAttribute(name, value)
    }
}