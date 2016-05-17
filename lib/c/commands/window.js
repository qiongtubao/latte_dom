	/**
		<img latte-window="window"></img>
		需要一个关闭按钮
		可以移动

		是否写成类？window
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = {};
	(function() {
		this.before = function(data, dom, controller) {
			var windowClassName = dom.getAttribute("latte-window");
			var latteObject = LatteObject.create(data);
			if(windowClassName) {
				var windowClass = require("./window/"+windowClassName);
				windowClass.create(data, dom, controller);	
			}

		};
	}).call(Command);
	
	module.exports = Command;window.js