	/**
		<img latte-window="window"></img>
		需要一个关闭按钮
		可以移动

		是否写成类？window
	*/
	var Command = {};
	var LatteObject = require("../../m/data.js");
	(function() {
		this.after = function(data, dom, controller) {
			var heightValueName = dom.getAttribute("latte-width");
			var latteObject = LatteObject.create(data);
			if(heightValueName) {
				dom.height = data.get(heightValueName);
				controller.on("data", heightValueName, function(value, oldValue) {
					dom.height = value;
				});
			}

		};
	}).call(Command);
	module.exports = Command;
	
	