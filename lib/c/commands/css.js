

	/**
		<p latte-css="height:{{h}}px;width:{{w}}px"></p>
		
		单项绑定
		data -> view

	*/
	var Css = require("../../v/css")
		, LatteObject = require("../../m/data");
	var Command = function(data, dom, controller) {
		var css = dom.getAttribute("latte-css");
		var latteObject = LatteObject.create(data);
		if(css) {
			var css = Css.create(css, dom);
			for(var i in css.binds) {
				css.change(i, data.get(i));
				(function(i){
					var cssDataChange = function(value) {
						if(controller.closed) {
							return controller.off("data", i, cssDataChange)
						}
						//css.change(i, data[i]);
						css.change(i, data.get(i));
					}
					controller.on("data", i, cssDataChange);
				})(i);
 				
			}
			
		}
	};
	module.exports = Command;
		
			