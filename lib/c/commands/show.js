


var Command  =  {

};
(function() {
	this.after = function(data, dom, controller) {
		var dataName = dom.getAttribute("latte-show");
		if(dataName) {
			var change = function(value) {	
				if(controller.closed) {
					return controller.unbind("data", dataName, change);
				}	
				if(!value ) {
					dom.style.display = "none";
				}else{
					dom.style.display = "";
				}
			}
			controller.bind("data", dataName, change);
			change(data.get(dataName));
		}
	}
}).call(Command);
module.exports = Command;