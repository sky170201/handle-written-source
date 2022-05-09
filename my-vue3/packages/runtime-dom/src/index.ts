import { createRenderer, h } from '@vue/runtime-core';
import { nodeOps } from './nodeOps'
import { patchProp } from "./patchProp"

// 准备好所有渲染时所需要的属性
const renderOptions = Object.assign({patchProp}, nodeOps)

console.log(renderOptions)
debugger
createRenderer(renderOptions).render(
    h('h1','candy'),
    document.getElementById('app')
);