	/**
		<img latte-dialog="true"></img>
		一般绑定的是src
		单项
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = function(data, dom, controller) {
		var isDialog = dom.getAttribute("latte-dialog");
		var latteObject = LatteObject.create(data);
		if(isDialog) {
				
		}

	};
	module.exports = Command;