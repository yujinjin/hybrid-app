/**
 * 作者：yujinjin9@126.com
 * 时间：2019-12-26
 *
 * @return 返回guid（String）
 * 描述：生成id随机数(年月日+8位随机数)
 */

export function generateRandomId() {
	let [_date, _id] = [new Date(), ""];
	_id = "xxxxxxxx".replace(/[xy]/g, function(c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
	_id = _date.getFullYear() + "" + (_date.getMonth() > 8 ? _date.getMonth() + 1 : "0" + (1 + _date.getMonth())) + "" + (_date.getDate() > 9 ? _date.getDate() : "0" + _date.getDate()) + _id;
	return _id;
}
