/*
 * @Author: 刘天福/YC002047
 * @Date: 2023-01-05 15:15:24
 * @Description: 
 */

export const NoFlags = /*                      */ 0b00000000000000000000000000;
export const Placement = /*                    */ 0b00000000000000000000000010;
export const Update = /*                       */ 0b00000000000000000000000100;

// commitRoot提交时需要拿MutationMask来判断是否有替换、更新等副作用
export const MutationMask = Placement | Update