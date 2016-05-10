

	/**
		<button latte-click="click"></button>
		data : {
			click: function(e) {
				console.log(this, e);   //data, e
			}
		}
	*/
	var Command = function(data, dom, controller) {
		var clickAttribute = dom.getAttribute("latte-click");
		if(clickAttribute) {
			var clickEvent = function(e) {
				if(controller.closed) {
					return controller.off("view", "click", clickEvent);
				}
				data.get(clickAttribute).call(data, e);
			}
			controller.on("view", "click", clickEvent);
		}
	};
	module.exports = Command;
	