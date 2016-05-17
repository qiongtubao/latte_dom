


var Command = {};
(function() {
	this.before = function(data, dom, controller) {
		var pageClassName = dom.getAttribute("latte-page");
		if(pageClassName) {
			var pageClass = require("./page/"+pageClassName);
			pageClass.create(data, dom, controller);	
		}
	}
}).call(Command);
module.exports = Command;