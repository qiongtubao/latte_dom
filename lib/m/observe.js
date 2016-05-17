
	var latte_lib = require("latte_lib");
	var LatteObject = function(data) {
		var self = this;
		this.childEvents = {};
		for(var i in data) {			
			var l = LatteObject.create(data[i]);
			if(l) {
				self.childEvents[i] = function(name, value, oldValue) {
					self.emit(i+"."+name, value, oldValue, data);
					self.emit("change", i+"."+name, value, oldValue, data);
				};
				l.on("change", self.childEvents[i]);	
			}		
		}
		data.latteObject = this;
	};
	(function() {

	}).call(LatteObject.prototype);
	(function(){
		this.create = function(data) {
			if(data.latteObject) {
				return data.latteObject;
			}
			console.log(latte_lib.getClassName(data));

		}
	}).call(LatteObject);
	module.exports = LatteObject;