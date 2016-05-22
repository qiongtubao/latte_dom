

	

	module.exports = {};
	(function() {
		this.stringRegExp = function(str) {
			var vernier = 0;
			var next = 1;
			var keys = [];
			while(next) {
				var startIndex = str.indexOf("{{", vernier);
				if(startIndex == -1) {
					next = 0;
					return keys;
				}
				var endIndex = str.indexOf("}}", startIndex);
				if(endIndex == -1) {
					next = 0;
					return keys;
				}
				keys.push(str.substring(startIndex+2, endIndex));
				vernier = endIndex;
			}
			
		}
		this.create = require("latte_lib").object.create;
		/**
		if(Object.observe) {
			this.create = require("./observe.js").create;
		}else if(Object.defineProperty) {
			
		}else{
			throw  new Error("This version does not support your browser ");
		}
		**/
	}).call(module.exports);
	