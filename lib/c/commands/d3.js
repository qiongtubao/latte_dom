/**
		<img latte-dialog="dialog"></img>
		
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = {};
	(function() {
		this.before = function(data, dom, controller) {
			var d3ClassName = dom.getAttribute("latte-d3");
			var latteObject = LatteObject.create(data);
			if(d3ClassName) {
				var dialogClass = require("./d3/"+d3ClassName);
				dialogClass.create(data, dom, controller);
			}

		};
	}).call(Command);
	
	module.exports = Command;