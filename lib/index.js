(function() {
	var Dom = require("./v/dom")
		, Data = require("./m/data")
		, Controller = require("./c/controller")
		, latte_lib = require("latte_lib");
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
	this.createObject = require("./m/data.js").create;
	this.dataBindData = function(data1, ps1, data2, ps2) {
		if(latte_lib.isString(ps1)) {
			ps1 = ps1.split(".");
		}
		if(latte_lib.isString(ps2)) {
			ps2 = ps2.split(".");
		}
		var v1 = data1;
		for(var i = 0 , len = ps1.length -1; i < len ;i++) {
			v1 = v1.get(ps1[i]);
		}
		var v2 = data2;
		for(var i = 0, len = ps2.length -1 ; i < len; i++) {
			v2 = v2.get(ps2[i]);
		}
		console.log(v1, ps1, v2, ps2);
		if(!v2.get(ps2[ps2.length - 1])) {
			v2.set(ps2[ps2.length -1], v1.get(ps1[ps1.length - 1]));
		}
		if(!v1.get(ps1[ps1.length - 1])) {
			v1.set(ps1[ps1.length -1], v2.get(ps2[ps2.length - 1]));
		}

		v1.on(ps1[ps1.length-1], function(value, oldValue) {
			if(value != oldValue) {
				v2.set(ps2[ps2.length-1], value);
			}
			
		});
		v2.on(ps2[ps2.length-1], function(value, oldValue) {
			if(value != oldValue) {
				v1.set(ps1[ps1.length-1], value);
			}
		});
	}
}).call(module.exports);