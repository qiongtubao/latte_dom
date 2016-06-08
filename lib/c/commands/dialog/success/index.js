var Success = function() {

};
(function() {

}).call(Success.prototype);
(function() {
		var html = require("./success.html");
		var doDom = function(dom) {
			dom.innerHTML = html + dom.innerHTML;
		}
		/**
			icon 问题 暂时想到使用SVG来解决 暂时未解决
		*/
	this.create = function(data, dom) {
		var Controller = require("../../../controller.js");
		//var dataName = dom.getAttribute("latte-data");
		var d = data;
		doDom(dom);
		//if(dataName) {
			//var d = data.get(dataName);
			for(var i = 0, len = dom.children.length; i < len; i++) {
				Controller.create(dom.children[i], d);
			}
			
		//}
		
	}
}).call(Success);
require("latte_dom/utils/css.js").importCssString(require("./success.css"), "latte_dialog_success");
module.exports = Success;