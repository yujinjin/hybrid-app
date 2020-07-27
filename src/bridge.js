/**
 * 作者：yujinjin9@126.com
 * 时间：2019-12-25
 * 描述：bridge桥接信息发送
 */

import base64 from "./base64";
import { generateRandomId } from "./utils";

export default function(config){
	return {
		/**
		 * 发送请求访问native的url
		 * @param url 请求的URL
		 */
		sendBridgeMsg(url) {
			var iframe = document.createElement("IFRAME");
			iframe.style.cssText = "display:none;border:0;width:0;height:0;";
			iframe.setAttribute("src", url);
			document.documentElement.appendChild(iframe);
			setTimeout(() => {
				iframe.parentNode.removeChild(iframe);
				iframe = null;
			}, 1000);
		},

		/**
		 * 把请求的协议Json数据对象生成加密后处理成scheme格式
		 * @param agreement 协议对象
		 */
		generateNativeUrl(agreement) {
			let [url, paramStr] = [config.scheme + agreement.tagname + "?t=" + new Date().getTime(), ""];
			if (agreement.callback) {
				url += "&callback=" + agreement.callback;
			}
			if (agreement.param) {
				paramStr = typeof agreement.param == "object" ? JSON.stringify(agreement.param) : agreement.param;
				url += "&param=" + encodeURIComponent(encodeURIComponent(base64.encode(paramStr)));
			}
			return url;
		},

		/**
		 * webkit 发送消息协议
		 * @param agreement 协议对象
		 */
		webkitPostMessage(agreement) {
			if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.health && window.webkit.messageHandlers.health.postMessage) {
				window.webkit.messageHandlers.health.postMessage(JSON.stringify(Object.assign({ service: "JKPlugin_native" }, agreement)));
			} else {
				console.error("webkit 发送消息协议对象不存在");
			}
		},

		/**
		 * 动态生成window函数
		 * @param agreement 协议对象
		 */
		generatorWebviewFun(callback, isDelete = true) {
			if (!callback || typeof callback !== "function") {
				callback = function(data) {
					console.info(data);
				};
			}
			const randomId = config.callbackFunName + "_" + generateRandomId();
			window[config.webViewFunName][randomId] = function(result) {
				this.callback = randomId;
				if (callback && typeof callback === "function") {
					callback.call(this, result);
				}
				if (isDelete) {
					delete window[config.webViewFunName][randomId];
				}
			};
			return randomId;
		},

		/**
		 * 清除当前Webview下的回调函数
		 */
		clearWebviewFun() {
			for (let key in window[config.webViewFunName]) {
				delete window[config.webViewFunName][key];
			}
		},

		/**
		 * 根据协议请求app
		 * @param agreement 协议对象
		 * @return 回调函数ID
		 */
		requestHybrid(agreementName, param, callback) {
			//console.info("协议对象:" + agreementName);
			if (!agreementName || !agreementName) {
				console.error("错误的请求协议，请检查协议的内容...");
				return;
			}
			//生成唯一执行函数，执行后销毁
			const agreement = { tagname: agreementName };
			agreement.callback = this.generatorWebviewFun(callback);
			if (param) {
				agreement.param = param;
			}
			if (window.webkit) {
				this.webkitPostMessage(agreement);
			} else {
				this.sendBridgeMsg(this.generateNativeUrl(agreement));
			}
			return agreement.callback;
		}
	}
};
