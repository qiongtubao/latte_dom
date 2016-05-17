	/**
		<img latte-dialog="true"></img>
		一般绑定的是src
		单项
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
		var Command = {};
		(function() {
			this.after = function(data, dom, controller) {
				var editorClassName = dom.getAttribute("latte-editor");
				var latteObject = LatteObject.create(data);
				if(editorClassName) {
					var editorClass = require("./editor/"+editorClassName);
					editorClass.create(data, dom, controller);
				}

			};
		}).call(Command);
	
	module.exports = Command;