
	/**
		内置
	*/
	var Command = function(data, dom, controller) {
		var Controller = require("../controller.js");
		for(var i = 0, l = dom.children.length; i < l ; i++) {
			(function(i, dom) {
				var child = dom.children[i];				
				Controller.create(child, data);
			})(i, dom);
								
		}

	};
	module.exports = Command;