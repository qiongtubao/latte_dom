(function(define) { 'use strict';
	define("latte_dom/dom", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
			var latte_lib = require("latte_lib");
			var DomOn = function(element, type, callback) {
				if(element.addEventListener) {
					element.addEventListener(type, callback);
				}else if (element.attachEvent) {
		            element.attachEvent("on" + type, handler);
		        } else {
		            element["on" + type] = handler;
		        }

				//console.log("dom no add Event")
			}
			var DomOff = function(element, type, callback) {

			}
			var Dom = function(id) {
				var element = document.getElementById(id);
				var self = this;
				DomOn(element, "change", function(value) {
					self.emit("change", element.value);
				});
				Object.defineProperty(this, "value", {
			        get: function () {
			        	return element.value;
			        },
			        set: function (value) { 
			        	element.value = value; 
			        }
			    });
				this.element = element;
			};
			latte_lib.inherits(Dom, latte_lib.events);
		(function() {

		}).call(Dom.prototype);
		module.exports = Dom;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
