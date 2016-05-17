
	/**
		问题1. 
	*/
	var LatteObject = require("../../m/data.js");
	var Command = {};
	(function() {
		this.before = function(data, dom, controller) {
			var list = dom.getAttribute("latte-list");
			var Controller = require("../controller.js");
			if(list) {
				var child = dom.children[0];
				dom.removeChild(child);
				for(var i = 0, len = data.get(list).length; i < len; i++) {
					(function(i) {
						var cloneChild = child.cloneNode(true);					
						dom.appendChild(cloneChild);
						Controller.create(dom.children[i], data.get(list).get(i));
					})(i);
					
				}
					var pushFunc = function(i, value, old) {
						var cloneChild = child.cloneNode(true);					
						dom.appendChild(cloneChild);
						Controller.create(dom.children[i], data.get(list).get(i));		
					};
					var setFunc = function(i, value, old) {
						Controller.remove(dom.children[i], old);
						Controller.create(dom.children[i], value);
					}
					var popFunc = function(o) {
						Controller.remove(dom.children[dom.children.length - 1], o);
						dom.removeChild(dom.children[dom.children.length - 1]);
					}
					var shiftFunc = function(o) {
						Controller.remove(dom.children[0], o);
						dom.removeChild(dom.children[0]);
					}
					var unshiftFunc = function() {
						var afterDom = dom.children[0];
						Array.prototype.forEach.call(arguments, function(o) {
							var cloneChild = child.cloneNode(true);	
							dom.insertBefore(cloneChild, afterDom);
							Controller.create(cloneChild, o);
						});
					}
					var spliceFunc = function(startIndex, num) {
						var adds = Array.prototype.splice.call(arguments, 2);
						for(var i = 0;i < num; i++) {
							var o = dom.children[startIndex];
							dom.removeChild(o);
							Controller.remove(o);
						}
						var afterDom = dom.children[startIndex];
						console.log(adds);
						adds.forEach(function(add) {
							var cloneChild = child.cloneNode(true);
							if(afterDom) {
								dom.insertBefore(cloneChild, afterDom);
							}else{
								dom.appendChild(cloneChild);
							}			
							Controller.create(cloneChild, add);
						});
					}
				var bind = function(d) {
					var listData = LatteObject.create(d);
					listData.on("push", pushFunc);
					listData.on("set", setFunc);
					listData.on("pop", popFunc);
					listData.on("shift", shiftFunc);
					listData.on("unshift", unshiftFunc);
					listData.on("splice", spliceFunc);
				}
				data.on(list, function(value, oldValue) {
					oldValue.off("push", pushFunc);
					oldValue.off("set", setFunc);
					oldValue.off("pop", popFunc);
					oldValue.off("shift", shiftFunc);
					oldValue.off("unshift", unshiftFunc);
					oldValue.off("splice", spliceFunc);
					for(var i = 0, len = dom.children.length; i < len; i++) {
						var child = dom.children[0];
						Controller.remove(child);
						dom.removeChild(child);
					}
					for(var i = 0, len = data.get(list).length; i < len; i++) {
						(function(i) {
							var cloneChild = child.cloneNode(true);					
							dom.appendChild(cloneChild);
							Controller.create(dom.children[i], data.get(list).get(i));
						})(i);
					}	
					bind(value);
				});
				bind(data.get(list));

			}
		};
	}).call(Command);
	
	module.exports = Command;