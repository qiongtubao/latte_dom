

	/**
		<button latte-click="click"></button>
		data : {
			click: function(e) {
				console.log(this, e);   //data, e
			}
		}
	*/
	var Command = {};
	(function() {
		this.after = function(data, dom, controller) {
			var clickAttribute = dom.getAttribute("latte-click");
			if(clickAttribute) {
				var clickEvent = function(e) {
					if(controller.closed) {
						return controller.unbind("view", "click", clickEvent);
					}
					var click = data.get(clickAttribute);
					click && click.call(data, e);
				}
				controller.bind("view", "click", clickEvent);
			}
		};
	}).call(Command);
	
	module.exports = Command;
	