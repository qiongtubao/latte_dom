	/**
		<button latte-class="{{glass}}"></button>
		data : {
			glass: ""
		}
	*/
	var LatteObject = require("../../m/data")
		, latte_lib = require("latte_lib");
	var Command = {};
	(function() {
		this.after = function(data, dom, controller) {
			var classStr = dom.getAttribute("latte-class");
			if(classStr) {
				var keys = LatteObject.stringRegExp(classStr);
				var json = {};

				keys.forEach(function(key) {
					json[key] = data.get(key) || "";
					var change = function(value, oldValue) {
						if(controller.closed) {
							controller.unbind("data", key, change);
						}
						if(oldValue != "") {
							dom.className = dom.className.replace(oldValue || "", " "+value+" ");
						}else{
							dom.className = dom.className + " " + value;
						}
						
					}
					controller.bind("data", key, change);
				});
				console.log("classData",data, dom.latteController);
		
				dom.className = dom.className + " " +latte_lib.format.templateStringFormat(classStr, json);
				
				
			}
		};
	}).call(Command);
	
	module.exports = Command;