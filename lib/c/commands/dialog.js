	/**
		<img latte-dialog="dialog"></img>
		
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = {};
	(function() {
		this.before = function(data, dom, controller) {
			var dialogClassName = dom.getAttribute("latte-dialog");
			var latteObject = LatteObject.create(data);
			if(dialogClassName) {
				var dialogClass = require("./dialog/"+dialogClassName);
				dialogClass.create(data, dom, controller);
			}

		};
	}).call(Command);
	
	module.exports = Command;