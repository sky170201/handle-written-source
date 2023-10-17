/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-18 16:45:09
 * @Description: 
 */
function getEventTarget(nativeEvent) {
    let target = nativeEvent.target || nativeEvent.srcElement || window;
    return target;
}

export default getEventTarget;
