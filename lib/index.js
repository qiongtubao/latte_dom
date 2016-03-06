(function(define) { 'use strict';
	define("latte_dom/index", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		(function() {
			var Dom = require("./dom");
			this.get = function(id) {
				//var elment = document.getElementById('id');
				return new Dom(id);
			}
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
