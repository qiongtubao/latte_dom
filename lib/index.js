(function() {
	var Dom = require("./v/dom")
		, Data = require("./m/data")
		, Controller = require("./c/controller");
		var find = function(id) {
			return document.querySelectorAll("*[latte-controller='"+id+"']");
		}
	this.define = function(id, data) {
		var doms = find(id);
		var controllers = [];
		if(doms) {
			for(var i = 0, len = doms.length ; i < len; i++) {
				var dom = doms[i];
				var controller = Controller.create(dom, data);
				controllers.push(controller);
			}
		}
		return controllers;
	}
	this.addCommand = function(command) {
		if(latte_lib.isString(command)) {
			return Controller.addCommand(require(command));
		}
		Controller.addCommand(command);
	}
}).call(module.exports);