

/**
	缺陷:
	还不能保存临时状态 就是跳转之后
	以及刷新的时候无法停留在当前页面
*/
var Command =  {};
var Routes = {};
var latte_lib = require("latte_lib");
(function() {
		var cache = {};
	/**
		回收以及处理机制暂时未实现
	*/
	this.get = function(data, callback) {
		var requireName = data.get("require");
		if(requireName ) { return require(requireName); }
		var urlName = data.get("url");
		Routes.getUrl(urlName, callback);
	}
	this.getUrl = function(url, callback) {
		if(cache[url]) {
			return callback(null, cache[url]);
		}
		/**
			暂时只支持简单的get
		*/
		latte_lib.xhr.get(url, {}, function(data) {
			cache[url] = data;
			callback(null, data);
		}, function(err) {
			console.log(err);
			callback(err);
		});

	}
}).call(Routes);
var latte_lib = require("latte_lib");
(function() {
	this.before = function(data, dom, controller) {
		var Controller = require("../controller.js");
		var dataName = dom.getAttribute("latte-route");
		if(dataName) {
			var change = function(value, oldValue) {
				var d = data.get(value);
				if(d) {
					Routes.get(d, function(err, html) {
						if(err) {
							return latte_lib.debug.error("no find the route view");
						}
						if(oldValue) {
							var oldD = data.get(oldValue);
							oldD.get("end") && oldD.get("end").call(oldD);
						}
						Controller.removeChild(dom);
						dom.innerHTML = (html);
						Controller.createChild(dom, d);
						d.get("start") && d.get("start").call(d);
						
						
					});
				}else{ latte_lib.debug.error("no the route"); }
			}
			data.on(dataName, change);
			change(data.get(dataName));
		}
	}
}).call(Command);
module.exports = Command;