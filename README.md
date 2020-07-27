## 简介
H5与app底层交互，以及协议常用协议。

## 底层协议的说明
说明：其URL地址是格式为:
```js
schema://(tagname)?callback=xxx&param=encodeURIComponent({})
```
所有的协议都会有一个回调函数用来接受APP的回传过来的消息。
    
具体JSON格式如下：
```javascript
{
    tagname: '', //协议的名称
    param: {},  //请求参数，会被Native使用
    callback: function (result) {} //Native处理成功后回调前端的方法,返回的result格式为：{success: true, error:{message: ''}, data:null}
}
```

## 使用
```javascript
import commonHybrid from "common-hybrid";

// APP主动通知h5的回调函数
let commonFunction = function(dataInfo){
    if (dataInfo.tagname === "login") {
        // native 登录
        ...
    } else if (dataInfo.tagname === "logout") {
        // native 登出
        ...
    }
}

// hybrid的配置
let config = {
    // scheme 名称
    scheme: "www://",
    // 全局回调函数名称，需要要与APP的开发人员约定好名称
    webViewFunName: "hybridFun",
    // 回调函数前缀（前缀_随机数）
    callbackFunName: "callback"
}

let hybrid = commonHybrid(commonFunction, config);
```

## 常用的协议说明
##### 1.forward 跳转
说明：协议的名称是：forward，表示当前H5的页面需要APP做跳转动作。

参数格式如下：
```js
// 第一个参数表示跳转的相关参数
param: {
    topage: 'home', // 跳转的页面地址，如果跳转到native页可以是一个页面name, 相关的页面参数可以放在urlParam
    type: 'native', // 跳转方式,native表示H5跳Native，webview表示H5新开Webview跳转，最后装载H5页面，wxMinProgram:表示跳转小程序，需要传topage(页面地址)、wxAppOriginalId(小程序的原始ID)、wxVersionsType(小程序的版本类型，0：正式版 1：开发板 2：体验版)
    replace: false, // 是否关闭当前webview窗口
    wxAppOriginalId: "", // 小程序的原始ID（小程序独有）
    wxVersionsType: 0 // 小程序的版本类型，0：正式版 1：开发板 2：体验版（小程序独有）
    urlParam: {}, // 页面URL参数，比如：详情页加id
    ... // 其他参数
}
// 第二个参数表示APP调用协议成功后的回调函数（可不传）
callbackFun: function(){

}
```



**注意：**
*在H5跳转到APP的native原生页时，如果APP新打开webview内的H5页面认为该页面是原生native页，H5就会终止页面的渲染，通过forward协议跳转原生页面，带来的问题就是H5新打开的原生页返回时会看到之前H5终止渲染的那个页面（页面一片空白）。*

*这里的解决方案是可以考虑通过fromApp这个参数来判断是否是当前app新打开的H5页面，如果是该参数就为:true,当H5发现该参数为true的时候会把forward协议中的replace参数设置为true,这样APP跳转的时候会把当前webview给关闭掉。*

*这是一个临时解决方案，最好的解决方案就是app监控H5的URL跳转，如果当前URL跳转的页面是原生自己的页面就会直接拦截掉，显示出原生的页面。*

##### 2.back 返回
说明：协议的名称是：back，表示H5页面的返回，这里有可能返回到H5页面，也可能会返回到上一个原生页面。

参数格式如下：
```js
// 第一个参数可以根据需要传入业务相关的参数（目前没有什么需要传的参数）
param: {
    ...
}

// 第二个参数表示APP调用协议成功后的回调函数（可不传）
callbackFun: function(){

}
```

##### 3.notice 通知
说明：H5 通知APP的事件。比如：H5登录、登出、数据有变动

参数格式如下：
```js
// 第一个参数可以根据需要传入业务相关的参数（目前没有什么需要传的参数）
param: {
    actions: "login", // 通知消息的名称（比如：登录-login,登出-logout）
    data: "" // 通知消息的数据
}

// 第二个参数表示APP调用协议成功后的回调函数（可不传）
callbackFun: function(){

}
```

##### 4.share 分享
说明：APP内的H5页面做分享
参数格式如下：
```js
// 第一个参数表示分享相关的信息
param: {
    type: "wxH5", // wxH5:微信分享H5页面, wxMinProgram：微信小程序, wxPoster: 微信海报（图片）
	title: "", // 标题
	desc: "", // 描述
	img: "", // 图片
	url: "", // 地址
	wxAppOriginalId: "", // 小程序的原始ID（小程序独有）
    wxVersionsType: 0, // 小程序的版本类型，0：正式版 1：开发板 2：体验版（小程序独有）
    defaultH5Url: "" // 如果当前微信版本太低不支持小程序就跳转到默认的H5地址（小程序独有）
}
// 第二个参数表示APP调用协议成功后的回调函数（可不传）
callbackFun: function(){

}
```

##### 5.setNativeData 更新native数据
说明：更新native数据,比如：修改本地的cookie、session信息，与notice的区别就是native更前端轻量级，notice更业务化

参数格式如下：
```js
// 第一个参数表示更新native数据的信息
param: {
    actions: 更新native数据的动作名称
	data: 更新的数据
}
// 第二个参数表示APP调用协议成功后的回调函数（可不传）
callbackFun: function(){

}
```

##### 6.getNativeData 获取native数据
说明：获取native数据,比如：获取到本地的cookie、session信息、当前登录的用户信息

参数格式如下：
```js
// 第一个参数表示获取native数据的信息
param: {
    actions: 获取native数据的动作名称
	data: 根据相关的参数获取native数据（可不传）
}
// 第二个参数表示回调函数（app会通过此函数返回数据）
callbackFun: function(data){

}
```

##### 7.updateNavbarStatus 修改导航状态
说明：修改导航状态,是否显示顶部header、是否显示底部tabbar

参数格式如下：
```js
// 第一个参数表示修改导航状态的信息
param: {
    isShowFoot: 是否显示底部导航栏
	isShowHead: 是否显示顶部 header
}
// 第二个参数表示APP调用协议成功后的回调函数（可不传）
callbackFun: function(){

}
```

##### 8.downloadImage 图片下载（保存）
说明：在APP的H5的页面中去下载图片

参数格式如下：
```js
// 第一个参数表示图片下载（保存）相关的信息
param: {
    imgUrl: 是否显示底部导航栏
}
// 第二个参数表示app下载图片是否正常的回调函数（可不传）
callbackFun: function(){

}
```

##### 9.customer 自定义扩展协议
说明：自定义扩展协议，可以根据实际的业务需要扩展出自定义的协议

参数格式如下：
```js
// 第一个参数表示协议名称信息
param: {
    imgUrl: 是否显示底部导航栏
}
// 第二个参数表示传给APP的相关参数
param: {
    ...
}
// 第三个参数表示调用协议后的回调函数
callbackFun: function(){

}
```

##### 10.clearWebviewFun 清除webview下的所有回调函数（非协议）
说明：清除webview下的所有回调函数（非协议）

无需传参数

## 待考虑项
    1.协议信息的安全机制，比如根据当前域名的白名单，或者协议信息的加密。


## 最后
- 如果喜欢一定要 star哈!!!（谢谢!!）

- 如果有意见和问题 请在 lssues提出，我会在线解答。