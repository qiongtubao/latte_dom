
	var LatteObject = require("../../m/data");
	var Command = {};
	(function() {
		this.after = function(data, dom, controller) {
			var duplex = dom.getAttribute("latte-duplex");
			if(duplex) {
				var latteObject = LatteObject.create(data);
				var domChange = function(value) {
					if(controller.closed) {
						return controller.unbind("view", "change", domChange);
					}
					data.set(duplex,  dom.value);
				}
				controller.bind("view","change", domChange);
				var duplexChange = function(value) {
					if(self.closed) {
						return controller.unbind("data",duplex, duplexChange);
					}
					dom.value = value;
				}
				controller.bind("data", duplex, duplexChange);
				dom.value = data.get(duplex);
			}
			
		};
	}).call(Command);
	
	module.exports = Command;
		
		