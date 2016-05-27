	/**
		设计上一个view ->controller
	*/
	var latte_lib = require("latte_lib")
		, LatteObject = require("../m/data.js");
		var Controller = function(view, data) {
			view.latteController = this;
			this.view = view;
			this.data = LatteObject.create(data);
			this.dataEvents = {};
			this.viewEvents = {};
			//dom.textContent = latte_lib.format.templateStringFormat(this.textContent, data);
			var self = this;
		

			Controller.befores.forEach(function(command){
				command(self.data, view, self);
			});
			Controller.middle(self.data, view, self);
			Controller.afters.forEach(function(command) {
				command(self.data, view, self);
			});
			this.emit("finish");
			
			
		};
		latte_lib.debug.error = function(e) {
			console.error(e);
		};
		latte_lib.inherits(Controller, latte_lib.events);
 		(function() {
			
			/**	
				存在问题 就是dom 并不是root
			*/
			this.bind = function(type, eventType, funcs) {
				if(!latte_lib.isArray(funcs)) {
					funcs = [funcs];
				}
				var f, events = this[type+"Events"];
				switch(type) {
					case "data":
						var o = this.data;
						f = o.on.bind(o);

					break;
					case "view":
						f = this.view.addEventListener.bind(this.view);
						
					break;
					default:
						latte_lib.debug.error("no the type");
						return;
					break;
				}
				
				for(var i = 0, len = funcs.length; i < len ; i++ ) {
					var func = funcs[i];
					if(!latte_lib.isFunction(func)) {
						latte_lib.debug.error("add function");
						return;
					}
					f(eventType, func);
				}
				events[eventType] = funcs.concat(events[eventType]);
			}
			this.unbind = function(type, eventType,funcs) {
				var f , events = this[type+"Events"];
				if(!latte_lib.isArray(funcs)) {
					funcs = [funcs];
				}
				switch(type) {
					case "data":
						f = this.data.off.bind(this.data);
					break;
					case "view":
						f = this.view.removeEventListener.bind(this.view);
					break;
				}
				for(var i = 0, len = funcs.length; i < len; i++) {
					var func = funcs[i]
						, fIndex = events[eventType].indexOf(func);
					if(fIndex == -1) {
						latte_lib.debug.error("not find the func");
					}
					f(eventType, func);
					events[eventType].splice(fIndex, 1); 
				}

			}
			
			this.close = function() {
				this.closed = 1;
				var o = LatteObject.create(this.data);
				var latteOff = o.off.bind(o);
				for(var i in this.dataEvents) {
					this.dataEvents[i].forEach(function(func) {
						latteOff(i, func);
					});
					delete this.dataEvents[i];
				}
				var viewOff = this.view.removeEventListener.bind(this.view);
				for(var i in this.viewEvents) {
					this.viewEvents[i].forEach(function(func) {
						viewOff(i, func);
					});
					delete this.viewEvents[i];
				}

				for(var i = 0, len = this.view.children.length; i < len; i++) {
					Controller.remove(this.view.children[i]);
				}
				delete this.view.latteController ;
				this.emit("close");
			}
		}).call(Controller.prototype);
		(function() {
			this.befores = [];
			this.afters = [];
			this.middle = function(data, dom, controller) {
				if(dom.getAttribute("latte-stop")) {
					return;
				}
				for(var i = 0, l = dom.children.length; i < l ; i++) {
					(function(i, dom) {
						var child = dom.children[i];				
						Controller.create(child, data);
					})(i, dom);
										
				}
			};
			
			this.addBefore = function(func) {
				if(latte_lib.isFunction(func)) {
					this.befores.push(func);
				}	
			}
			this.addAfter = function(func) {
				if(latte_lib.isFunction(func)) {
					this.afters.push(func);
				}
			}
			this.create = function(dom, data) {
				if(dom.latteController) {
					return dom.latteController;
				}
				return new Controller(dom, data);
			}
			this.remove = function(dom, data, controller) {
				if(!dom) {
					return;
				}
				controller = controller || dom.latteController;
				controller && controller.close();
			}
			this.removeChild = function(dom) {
				for(var i = 0, len = dom.children.length; i < len; i++) {
					Controller.remove(dom.children[i]);
					dom.removeChild(dom.children[i]);
				}
			}
			this.createChild = function(dom, data) {
				for(var i = 0, len = dom.children.length; i < len; i++) {
					Controller.create(dom.children[i], data);
				}
			}
			this.addCommand = function(func) {
				Controller.addBefore(func.before);
				Controller.addAfter(func.after || func);
			}
		}).call(Controller);
		latte.require.find("latte_dom/c/commands/").forEach(function(o){
			var r = require("./commands/"+o);
			Controller.addCommand(r );
		});
		module.exports = Controller;