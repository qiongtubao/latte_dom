
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
			var stringContent = dom.getAttribute("latte-src");
			var latteObject = LatteObject.create(data);
			if(stringContent) {
				var keys = LatteObject.stringRegExp(stringContent);
				dom.src = latte_lib.format.templateStringFormat(stringContent, data.toJSON());
				keys.forEach(function(key) {
					controller.bind("data", key, function() {
						dom.src = latte_lib.format.templateStringFormat(stringContent, data.toJSON());
					});
				});
			}

		};
	}).call(Command);
	
	module.exports = Command;