/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-06 16:06:00
 * @Description: 
 */

// 设置css样式
export function setValueForStyles(node, styles) {
    const style = node.style;
    for (let styleName in styles) {
        if (styles.hasOwnProperty(styleName)) {
            const styleValue = styles[styleName]
            style[styleName] = styleValue;
        }
    }
}