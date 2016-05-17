

	/**
		<p latte-css="height:{{h}}px;width:{{w}}px"></p>
		
		单项绑定
		data -> view

	*/
	var Css = require("../../v/css")
		, LatteObject = require("../../m/data");
	var Command = {};
	(function() {
		this.after = function(data, dom, controller) {
			var css = dom.getAttribute("latte-css");
			var latteObject = LatteObject.create(data);
			if(css) {
				var css = Css.create(css, dom);
				for(var i in css.binds) {
					css.change(i, data.get(i));
					(function(i){
						
						var cssDataChange = function(value) {
							if(controller.closed) {
								return controller.unbind("data", i, cssDataChange)
							}
							//css.change(i, data[i]);
							css.change(i, data.get(i));
						}
						controller.bind("data", i, cssDataChange);
					})(i);
	 				
				}
				
			}
		};
	}).call(Command);
	
	module.exports = Command;
		
			