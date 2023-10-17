/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 10:34:13
 * @Description: 
 */
import {
    createRoot as createRootImpl,
} from './';

/**
 * 创建根
 * @param {*} container 容器
 * @param {*} options 选项
 * @returns 
 */
export function createRoot(container,options) {
    return createRootImpl(container, options);
}