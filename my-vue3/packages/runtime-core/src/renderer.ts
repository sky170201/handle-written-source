import { getSequence, isSameVNodeType, ShapeFlags } from "@vue/shared";


export function createRenderer(options) {
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        setText: hostSetText,
        setElementText: hostSetElementText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling
    } = options
    
    // 创建真实DOM
    const mountChildren = (children,container) =>{
        for(let i = 0; i < children.length;i++){
            patch(null,children[i],container);
        }
    }
    const mountElement = (vnode,container) =>{
        const {type,props,shapeFlag} = vnode
        let el = vnode.el = hostCreateElement(type); // 创建真实元素，挂载到虚拟节点上
        if(props){ // 处理属性
            for(const key in props){ // 更新元素属性
                hostPatchProp(el,key,null,props[key]); 
            }
        }
        if(shapeFlag & ShapeFlags.TEXT_CHILDREN){ // 文本
            hostSetElementText(el, vnode.children);
        }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){ // 多个儿子
            mountChildren(vnode.children,el);
        }
        hostInsert(el,container); // 插入到容器中
    }

    const patchElement = (n1, n2) => {
        let el = (n2.el = n1.el);
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        hostPatchProp(oldProps, newProps, el); // 比对新老属性
        patchChildren(n1, n2, el); // 比较元素的孩子节点
    }
    const processElement = (n1, n2, container) => {
        if (n1 == null) {
            mountElement(n2, container)
        } else {
            patchElement(n1, n2); // 比较两个元素
        }
    }
    const patchChildren = (n1,n2,el) => {
        const c1 = n1 && n1.children
        const c2 = n2.children
        const prevShapeFlag = n1.shapeFlag;
        const shapeFlag = n2.shapeFlag;
        if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
            if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
                unmountChildren(c1);
            }
            if(c1 !== c2){
                hostSetElementText(el,c2);
            }
        }else {
            if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
                if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
    
                }else{
                    unmountChildren(c1);
                }
            }else{
                if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
                    hostSetElementText(el,'');
                }
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    mountChildren(c2, el);
                }
            }
        }
    }

    const unmountChildren = (children) =>{
        for(let i = 0 ; i < children.length; i++){
            unmount(children[i]);
        }
    }

    // 核心diff算法
    const patchKeydChildren = (c1, c2, container) => {
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        // 1. sync from start
        // (a b) c
        // (a b) d e
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container)
            } else {
                break;
            }
            i++;
        }
        // 2. sync from end
        // a (b c)
        // d e (b c)
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container);
            } else {
                break;
            }
            e1--;
            e2--;
        }
        // 3. common sequence + mount
        // (a b)
        // (a b) c
        // i = 2, e1 = 1, e2 = 2
        // (a b)
        // c (a b)
        // i = 0, e1 = -1, e2 = 0
        if (i > e1) { // 说明有新增 
            if (i <= e2) { // 表示有新增的部分
                // 先根据e2 取他的下一个元素  和 数组长度进行比较
                const nextPos = e2 + 1;
                const anchor = nextPos < c2.length ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, anchor);
                    i++;
                }
            }
        }
        // 4. common sequence + unmount
        // (a b) c
        // (a b)
        // i = 2, e1 = 2, e2 = 1
        // a (b c)
        // (b c)
        // i = 0, e1 = 0, e2 = -1
        else if (i > e2) {
            while (i <= e1) {
                unmount(c1[i])
                i++
            }
        }
        // 最长递增子序列
        // 5. unknown sequence
        // a b [c d e] f g
        // a b [e c d h] f g
        // i = 2, e1 = 4, e2 = 5
        const s1 = i;
        const s2 = i;
        const keyToNewIndexMap = new Map();
        for (let i = s2; i <= e2; i++) {
            const nextChild = c2[i];
            keyToNewIndexMap.set(nextChild.key, i);
        }
        const toBePatched = e2 - s2 + 1;
        const newIndexToOldMapIndex = new Array(toBePatched).fill(0);
        for (let i = s1; i <= e1; i++) {
            const prevChild = c1[i];
            let newIndex = keyToNewIndexMap.get(prevChild.key); // 获取新的索引
            if (newIndex == undefined) {
                unmount(prevChild); // 老的有 新的没有直接删除
            } else {
                newIndexToOldMapIndex[newIndex - s2] = i + 1;
                patch(prevChild, c2[newIndex], container);
            }
        }
        // [5,3,4,0] => [1,2]
        let increasingNewIndexSequence = getSequence(newIndexToOldMapIndex);
        let j = increasingNewIndexSequence.length - 1; // 取出最后一个人的索引
        for (let i = toBePatched - 1; i >= 0; i--) {
            const nextIndex = s2 + i; // [ecdh]   找到h的索引 
            const nextChild = c2[nextIndex]; // 找到 h
            let anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null; // 找到当前元素的下一个元素
            if (newIndexToOldMapIndex[i] == 0) { // 这是一个新元素 直接创建插入到 当前元素的下一个即可
                patch(null, nextChild, container, anchor)
            } else {
                // 根据参照物 将节点直接移动过去  所有节点都要移动 （但是有些节点可以不动）
                hostInsert(nextChild.el, container, anchor);
            }
        }
    }

    const patch = (n1, n2, container, anchor?) => {
        // 初始化和diff算法都在这里
        if (n1 == n2) {
            return
        }
        if (n1 && !isSameVNodeType(n1, n2)) { // n1和n2不是同一个节点
            unmount(n1)
            n1 = null
        }
        if (n1 == null) { // 初始化情况
            mountElement(n2, container)
        } else {
            // diff算法
        }
    }
    const unmount = (vnode) =>{hostRemove(vnode.el)}
    const render = (vnode, container) => {
        if (vnode == null) {
            if (container._vnode) { // 卸载
                unmount(container._vnode) // 找到对应的真实节点将其卸载
            }
        } else {
            patch(container._vnode || null, vnode, container); // 初始化和更新
        }
        container._vnode = vnode
    }
    return {
        render
    }
}