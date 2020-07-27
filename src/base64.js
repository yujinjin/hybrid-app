/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  update by yujinjin9@126.com 2019/12/25
 */

export default (function () {
	"use strict";
	var version = "2.1.9";
	// if node.js, we use Buffer
	var buffer;
	if (typeof module !== "undefined" && module.exports) {
		try {
			buffer = require("buffer").Buffer;
		} catch (err) {
			console.error(buffer);
		}
	}
	// constants
	var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var b64tab = (function (bin) {
		var t = {};
		for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
		return t;
	})(b64chars);
	var fromCharCode = String.fromCharCode;
	// encoder stuff
	var cb_utob = function (c) {
		var cc;
		if (c.length < 2) {
			cc = c.charCodeAt(0);
			return cc < 0x80 ? c : cc < 0x800 ? fromCharCode(0xc0 | (cc >>> 6)) + fromCharCode(0x80 | (cc & 0x3f)) : fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | (cc & 0x3f));
		} else {
			cc = 0x10000 + (c.charCodeAt(0) - 0xd800) * 0x400 + (c.charCodeAt(1) - 0xdc00);
			return fromCharCode(0xf0 | ((cc >>> 18) & 0x07)) + fromCharCode(0x80 | ((cc >>> 12) & 0x3f)) + fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) + fromCharCode(0x80 | (cc & 0x3f));
		}
	};
	var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
	var utob = function (u) {
		return u.replace(re_utob, cb_utob);
	};
	var cb_encode = function (ccc) {
		var padlen = [0, 2, 1][ccc.length % 3],
			ord = (ccc.charCodeAt(0) << 16) | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) | (ccc.length > 2 ? ccc.charCodeAt(2) : 0),
			chars = [b64chars.charAt(ord >>> 18), b64chars.charAt((ord >>> 12) & 63), padlen >= 2 ? "=" : b64chars.charAt((ord >>> 6) & 63), padlen >= 1 ? "=" : b64chars.charAt(ord & 63)];
		return chars.join("");
	};
	var btoa = function (b) {
		return b.replace(/[\s\S]{1,3}/g, cb_encode);
	};
	var _encode = buffer
		? function (u) {
			return (u.constructor === buffer.constructor ? u : new buffer(u)).toString("base64");
		}
		: function (u) {
			return btoa(utob(u));
		};
	var encode = function (u, urisafe) {
		return !urisafe
			? _encode(String(u))
			: _encode(String(u))
				.replace(/[+\\/]/g, function (m0) {
					return m0 == "+" ? "-" : "_";
				})
				.replace(/=/g, "");
	};
	var encodeURI = function (u) {
		return encode(u, true);
	};
	// decoder stuff
	var re_btou = new RegExp(["[\xC0-\xDF][\x80-\xBF]", "[\xE0-\xEF][\x80-\xBF]{2}", "[\xF0-\xF7][\x80-\xBF]{3}"].join("|"), "g");
	var cb_btou = function (cccc) {
		switch (cccc.length) {
			case 4:
				var cp = ((0x07 & cccc.charCodeAt(0)) << 18) | ((0x3f & cccc.charCodeAt(1)) << 12) | ((0x3f & cccc.charCodeAt(2)) << 6) | (0x3f & cccc.charCodeAt(3)),
					offset = cp - 0x10000;
				return fromCharCode((offset >>> 10) + 0xd800) + fromCharCode((offset & 0x3ff) + 0xdc00);
			case 3:
				return fromCharCode(((0x0f & cccc.charCodeAt(0)) << 12) | ((0x3f & cccc.charCodeAt(1)) << 6) | (0x3f & cccc.charCodeAt(2)));
			default:
				return fromCharCode(((0x1f & cccc.charCodeAt(0)) << 6) | (0x3f & cccc.charCodeAt(1)));
		}
	};
	var btou = function (b) {
		return b.replace(re_btou, cb_btou);
	};
	var cb_decode = function (cccc) {
		var len = cccc.length,
			padlen = len % 4,
			n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) | (len > 3 ? b64tab[cccc.charAt(3)] : 0),
			chars = [fromCharCode(n >>> 16), fromCharCode((n >>> 8) & 0xff), fromCharCode(n & 0xff)];
		chars.length -= [0, 0, 2, 1][padlen];
		return chars.join("");
	};
	var atob = function (a) {
		return a.replace(/[\s\S]{1,4}/g, cb_decode);
	};
	var _decode = buffer
		? function (a) {
			return (a.constructor === buffer.constructor ? a : new buffer(a, "base64")).toString();
		}
		: function (a) {
			return btou(atob(a));
		};
	var decode = function (a) {
		return _decode(
			String(a)
				.replace(/[-_]/g, function (m0) {
					return m0 == "-" ? "+" : "/";
				})
				.replace(/[^A-Za-z0-9+\\/]/g, "")
		);
	};
	// export Base64
	return {
		VERSION: version,
		atob: atob,
		btoa: btoa,
		fromBase64: decode,
		toBase64: encode,
		utob: utob,
		encode: encode,
		encodeURI: encodeURI,
		btou: btou,
		decode: decode
	};
})();
