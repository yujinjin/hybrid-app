/**
 * 作者：yujinjin9@126.com
 * 时间：2019-12-25
 * 描述：hybrid协议
 */

import _bridge from "./bridge";

/**
 * @param commonFunction APP主动通知h5的回调函数
 * @param config hybrid配置
 */
export default function(commonFunction, config) {
	const bridge = _bridge(config);
	// 初始化
	let init = function() {
		window[config.webViewFunName] = window[config.webViewFunName] || {};

		if (commonFunction && typeof commonFunction == "function") {
			// 定义固定函数，主要是用于native主动回调H5的方法
			window[config.webViewFunName].common = function(dataInfo) {
				try {
					if(typeof(dataInfo) == "string") {
						dataInfo = JSON.parse(dataInfo);
					}
				} catch (e) {
					console.error("解析app的协议失败:" + e.message + "协议内容：" + dataInfo);
				}
				if (dataInfo.tagname) {
					console.error("app的格式不正确，协议内容：" + JSON.stringify(dataInfo));
				}
				commonFunction(dataInfo);
			};
		}
	};

	init();

	return {
		/**
		 * 表示当前H5的页面需要APP做跳转动作
		 * @param param 参数 {
		 * 	topage: 跳转的页面地址，如果跳转到native页可以是一个页面name, 相关的页面参数可以放在urlParam,
		 * 	type: 'native', // 跳转方式,native表示H5跳Native，webview表示H5新开Webview跳转，最后装载H5页面，wxMinProgram:表示跳转小程序，需要传topage(页面地址)、wxAppOriginalId(小程序的原始ID)、wxVersionsType(小程序的版本类型，0：正式版 1：开发板 2：体验版)
		 * 	replace: false, // 是否关闭当前webview窗口
		 * 	wxAppOriginalId: "", // 小程序的原始ID（小程序独有）
		 * 	wxVersionsType: 0 // 小程序的版本类型，0：正式版 1：开发板 2：体验版（小程序独有）
		 * 	urlParam: {}, // 页面URL参数，比如：详情页加id
		 * 	... // 其他参数
		 * }
		 */ 
		forward(param, callbackFun) {
			if (!param || !param.topage) {
				console.error({ message: "H5向前跳转navtive页面协议内容错误", param });
				return;
			}
			param.type = param.type || "native";
			return bridge.requestHybrid("forward", param, callbackFun);
		},

		/**
		 * H5向前跳转navtive页面
		 * @param param 可以根据需要传入业务相关的参数
		 */ 
		back(param = {}, callbackFun) {
			if (!param) {
				console.error({ message: "H5向后跳转navtive页面协议内容错误", param });
				return;
			}
			return bridge.requestHybrid("back", param, callbackFun);
		},

		/**
		 * H5 通知APP的事件。比如：H5登录、登出、数据有变动
		 * @param param 参数 {
		 * 	actions: 通知消息的名称（比如：登录-login,登出-logout）
		 * 	data: 通知消息的数据
		 * }
		 */
		notice({actions, data = null}, callbackFun) {
			if (!actions) {
				console.error({ message: "H5 通知APP的事件名称不能为空", actions, data });
				return;
			}
			return bridge.requestHybrid("notice", {actions, data}, callbackFun);
		},

		/**
		 * 用户分享
		 * @param param 参数 {
		 * 	type: "wxH5", // wxH5:微信分享H5页面, wxMinProgram：微信小程序, wxPoster: 微信海报（图片）
		 * 	title: "", // 标题
		 * 	desc: "", // 描述
		 * 	img: "", // 图片
		 * 	url: "", // 地址
		 * 	wxAppOriginalId: "", // 小程序的原始ID（小程序独有）
         * 	wxVersionsType: 0, // 小程序的版本类型，0：正式版 1：开发板 2：体验版（小程序独有）
         * 	defaultH5Url: "" // 如果当前微信版本太低不支持小程序就跳转到默认的H5地址（小程序独有）
		 * }
		 */ 
		share(param, callbackFun) {
			if(!param) {
				console.error({ message: "没有分享的数据", name, data });
				return;
			}
			param.type = param.type || "wxH5";
			return bridge.requestHybrid("share", param, callbackFun);
		},

		/**
		 * 更新native数据,比如：修改本地的cookie、session信息，与notice的区别就是native更前端轻量级，notice更业务化
		 * @param param 参数 {
		 * 	actions: 更新native数据的动作名称
		 * 	data: 更新的数据
		 * }
		 */
		setNativeData(param, callbackFun) {
			if (!param || !param.actions) {
				console.error({ message: "更新native数据协议内容错误", param });
				return;
			}
			return bridge.requestHybrid("setNativeData", param, callbackFun);
		},

		/**
		 * 获取native数据,比如：获取到本地的cookie、session信息、当前登录的用户信息
		 * @param param 参数 {
		 * 	actions: 获取native数据的动作名称
		 * 	data: 根据相关的参数获取native数据（可不传）
		 * }
		 * @param callbackFun 回调函数（app会通过此函数返回数据）
		 */
		getNativeData(param, callbackFun) {
			if (!param || !param.actions) {
				console.error({ message: "获取native数据协议内容错误", param });
				return;
			}
			return bridge.requestHybrid("getNativeData", param, callbackFun);
		},

		/**
		 * 修改导航状态
		 * @param param 参数 {
		 * 	isShowFoot: 是否显示底部导航栏
		 * 	isShowHead: 是否显示顶部 header
		 * }
		 */ 
		updateNavbarStatus({ isShowFoot = false, isShowHead = false }, callbackFun) {
			return bridge.requestHybrid("updateNavbarStatus", { isShowHead, isShowFoot }, callbackFun);
		},

		/**
		 * 图片下载（保存）协议
		 * @param param 参数 {
		 *  imgUrl: 图片地址（必传）
		 * }
		 * @param callbackFun app下载图片是否正常的回调函数
		 */ 
		downloadImage(param, callbackFun) {
			if (!param || !param.imgUrl) {
				console.error({ message: "图片下载（保存）协议中的图片URL错误", param });
				return;
			}
			return bridge.requestHybrid("downloadImage", param, callbackFun);
		},

		/**
		 * 清除webview下的回调函数
		 */
		clearWebviewFun() {
			bridge.clearWebviewFun();
		},

		/**
		 * 自定义扩展协议，可以根据实际的业务需要扩展出自定义的协议
		 * @param agreementName 协议名称
		 * @param param 参数
		 * @param callbackFun 协议的回调函数
		 */
		customer(agreementName, param = {}, callbackFun) {
			if (!agreementName) {
				console.error({ message: "协议名称没有参数！" });
				return;
			}
			return bridge.requestHybrid(agreementName, param, callbackFun);
		}
	};
}
