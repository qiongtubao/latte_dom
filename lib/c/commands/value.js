	/**
		<option latte-src="i"></option>
		一般绑定的是src
		单项
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = {};
	(function() {
		this.after = function(data, dom, controller) {
			var valueName = dom.getAttribute("latte-value");
			var latteObject = LatteObject.create(data);
			if(valueName) {
				var change = function(value) {
					if(controller.closed) {
						return controller.unbind("data", valueName, change);
					}
					dom.value = value;
				};
				controller.bind("data", valueName, change);
				change(data.get(valueName));
			}

		};
	}).call(Command);
	
	module.exports = Command;