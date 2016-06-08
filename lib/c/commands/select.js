	var Command = {};
	(function() {
		/**
			1.change  2次执行

		*/
		var Dom = require("../../utils/dom.js");
		this.beforeLevel = 1;
		this.before = function(data, dom, controller) {
			var Controller = require("../controller.js");
			var selectDataName = dom.getAttribute("latte-select");
			if(selectDataName) {
				if(!dom.getAttribute("latte-duplex")) {
					dom.setAttribute("latte-duplex", selectDataName+".value");
				}
				if(!dom.getAttribute("latte-list")) {
					dom.setAttribute("latte-list", selectDataName+".data");
				}
				if(dom.innerHTML.indexOf("<") == -1) {
					dom.innerHTML='<option latte-value="value">{{key}}</option>';
				}
			}
		}
	}).call(Command);
	module.exports = Command;