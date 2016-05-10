
	var LatteObject = require("../../m/data");
	var Command = function(data, dom, controller) {
		var duplex = dom.getAttribute("latte-duplex");
		if(duplex) {
			var latteObject = LatteObject.create(data);
			var domChange = function(value) {
				if(controller.closed) {
					return controller.off("view", "change", domChange);
				}
				data.set(duplex,  dom.value);
			}
			controller.on("view","change", domChange);
			var duplexChange = function(value) {
				if(self.closed) {
					return controller.off("data",duplex, duplexChange);
				}
				dom.value = value;
			}
			controller.on("data", duplex, duplexChange);
			dom.value = data.get(duplex);
		}
		
	};
	module.exports = Command;
		
		