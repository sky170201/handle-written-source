import { isString, ShapeFlags } from "@vue/shared"

export function isVNode(value: any){
    return value ? value.__v_isVNode === true : false
}

export const createVNode = (type, props, children = null) => {
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
    const vnode = {
        __v_isVNode: true,
        type,
        props,
        key: props && props['key'],
        el: null,
        children,
        shapeFlag
    }
    if (children) {
        let type = 0
        if (Array.isArray(children)) {
            type = ShapeFlags.ARRAY_CHILDREN
        } else {
            children = String(children)
            type = ShapeFlags.TEXT_CHILDREN
        }
        vnode.shapeFlag |= type // 位运算
        // 如果shapeFlag为9 说明元素中包含一个文本
        // 如果shapeFlag为17 说明元素中有多个子节点
    }
    return vnode
}