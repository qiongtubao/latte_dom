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
			var changeAttribute = dom.getAttribute("latte-change");
			if(changeAttribute) {
				var clickEvent = function(e) {
					if(controller.closed) {
						return controller.unbind("view", "change", clickEvent);
					}
					var click = data.get(changeAttribute);
					click && click.call(data, e);
				}
				controller.bind("view", "change", clickEvent);
			}
		};
	}).call(Command);
	
	module.exports = Command;