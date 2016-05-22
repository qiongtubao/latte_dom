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
		this.after = function(data, dom, controller) {
			var widthValueName = dom.getAttribute("latte-width");
			var latteObject = LatteObject.create(data);
			if(widthValueName) {
				dom.width = data.get(widthValueName);
				controller.on("data", widthValueName, function(value, oldValue) {
					dom.width = value;
				});
			}

		};
	}).call(Command);
	
	module.exports = Command;window.js