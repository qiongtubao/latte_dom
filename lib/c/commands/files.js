var Command = {};
(function(){
	var Dom = require("../../utils/dom.js");
	this.after = function(data, dom, controller) {
		var eventName = dom.getAttribute("latte-files");
		if(eventName) {

			Dom.stopDrop();

			dom.addEventListener("drop", function(e) {
				var callback = data.get(eventName);
				callback.call(data, e.dataTransfer.files);
			});
		}
		
	}
}).call(Command);
module.exports = Command;