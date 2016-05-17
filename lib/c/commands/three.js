	/**
		<img latte-src="i"></img>
		一般绑定的是src
		单项
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = {};
	(function() {
		this.after = function(data, dom, controller) {
			var threeClassName = dom.getAttribute("latte-three");
			var latteObject = LatteObject.create(data);
			if(threeClassName) {
				var threeClass = require("./three/"+ threeClassName);
				threeClass.create(data, dom, controller);
			}

		};
	}).call(Command);
	
	module.exports = Command;