	/**
		<img latte-window="window"></img>
		需要一个关闭按钮
		可以移动

		是否写成类？window
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = function(data, dom, controller) {
		var windowClass = dom.getAttribute("latte-window");
		var latteObject = LatteObject.create(data);
		if(isDialog) {
				
		}

	};
	module.exports = Command;window.js