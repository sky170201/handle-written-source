/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 15:49:22
 * @Description: 
 */
export function scheduleCallback (callback) {
    requestIdleCallback(callback)
}