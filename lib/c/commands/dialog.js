	/**
		<img latte-dialog="dialog"></img>
		
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = function(data, dom, controller) {
		var dialogClass = dom.getAttribute("latte-dialog");
		var latteObject = LatteObject.create(data);
		if(dialogClass) {
				
		}

	};
	module.exports = Command;