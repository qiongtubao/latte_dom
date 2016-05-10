

	/**
		<input latte-bind="i"></input>
		$in:[input] 
		because dom.value;
		一般用于显示  并且单项绑定
		dom -> data
	*/
	var Command = function(data, dom, controller) {
		var bindAttribute = dom.getAttribute("latte-bind");
		
		if(bindAttribute) {
			var bindChange = function(e) {				
				if(controller.closed) {
					return controller.off("view", "change", bindChange);
				}
				data.set(bindAttribute, dom.value);
			}
			controller.on("view", "change", bindChange);
			//dom.addEventListener("change", bindChange);
		}

	};
	module.exports = Command;