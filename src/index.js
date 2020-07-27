/**
 * 作者：yujinjin9@126.com
 * 时间：2020-07-21
 * 描述：hybrid技术框架常用协议
 */
import config from "./config";
import hybrid from "./hybrid";

/**
 * @param commonFunction APP主动通知h5消息的回调函数
 * @param customConfig 用户自定义的hybrid配置
 */
export default function(commonFunction, customConfig = {}) {
    return hybrid(commonFunction, Object.assign({}, config, customConfig))
}