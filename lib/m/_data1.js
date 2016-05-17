



	var latte_lib = latte.require("latte_lib");


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
		if(Object.observe) {
			//latte_lib.debug.error("use observe");
			Object.observe(data, function(os) {
				os.forEach(function(o) {
					
						var latte = LatteObject.create(data[o.name]) ;
						if(latte  &&  !self.childEvents[o.name]) {
							//latte.hasEvent("change", self.childEvents[o.name])
							self.childEvents[o.name] = function(key, value, old, data) {
								self.emit("change", name+"."+key, value, old, data)
							};
							latte.on("change", self.childEvents[o.name]);
						}
						
					
					if(data[o.name] == null && o.oldValue) {
						o.oldValue.off("change", self.childEvents[o.name]);
						self.childEvents[o.name] = null;
					}
					self.emit(o.name, data[o.name], o.oldValue, data);
					self.emit("change", o.name, data[o.name], o.oldValue, data);
				});
			});
		}else{
			//on的时候才会进行绑定 未完成
			
			//1.暂时不支持 多层监控
			//2.不支持全方面监控必须要知道改变那个对应监控
			
			var _on = this.on.bind(this);
			Object.defineProperty(data, "change", {
			  	__proto__: null, // 没有继承的属性
			  	writable: false
			});
			
			this.on = function(dataName, func) {
				_on(dataName, func);
				if(dataName == "change") {
					return ;
				}
				if(data["_"+dataName]) {
					return;
				}
				data["_"+dataName] = data[dataName];
				Object.defineProperty(data, dataName, {
					enumerable: true,
  					configurable: true,
					get: function() {
						return data["_"+dataName];
					},
					set: function(value) {
						data["_"+dataName] = value;
						self.emit(dataName, value);
						self.emit("change", dataName, value);
					}
				});

			}
			
		}
		
		
	};
	latte_lib.inherits(LatteObject, latte_lib.events);
	(function() {
		
	}).call(LatteObject.prototype);
	(function() {
			function getClassName(data) {
				if(Array.isArray(data)){
					return "Array";
				}
				if(typeof data == "object") {
					return "Object";
				}
			}
			this.stringRegExp = function(str) {
				var vernier = 0;
				var next = 1;
				var keys = [];
				while(next) {
					var startIndex = str.indexOf("{{", vernier);
					if(startIndex == -1) {
						next = 0;
						return keys;
					}
					var endIndex = str.indexOf("}}", startIndex);
					if(endIndex == -1) {
						next = 0;
						return keys;
					}
					keys.push(str.substring(startIndex+2, endIndex));
					vernier = endIndex;
				}
				
			}
		this.create = function(data) {
			if(data.latteObject) {
				return data.latteObject;
			}
			switch(getClassName(data)) {
				case "Array":
					return new LatteArray(data);
				break;
				case "Object":
					return new LatteObject(data);
				break;
			}
			
			
		}
	}).call(LatteObject);
	var LatteArray = function(data) {
		data.latteObject = this;
		var self = this;
		var addEvent = function(key, value, oldValue, o) {
			var index = data.indexOf(o);
			if(index == -1) {
				return o.latteObject.off("change", i+"."+key, value, oldValue, o);
			}
			self.emit(index + "." + key, value, oldValue, o);
			self.emit("change", index + "." + key, value, oldValue, o);
		}
		data.forEach(function(o) {
			var lo = LatteObject.create(o);
			if(lo){
				lo.on("change", addEvent);
			}
		});
		if(Array.observe) {
			Array.observe(data, function(os) {
				var changes = {};
				os.forEach(function(o) {
					switch(o.type) {
						case "splice":
							//	循环
							o.object.forEach(function(v, index) {
								var d = LatteObject.create(v);
								if(d && !d.hasEvent("change",addEvent) ){
									d.on("change", addEvent);
								}
								changes[index] = v;
								//self.emit("change", index, v, null, data);
								//self.emit(index, v, null, data);
							});
							o.removed.forEach(function(v) {
								v.latteObject && v.latteObject.off("change", addEvent);
							});

							if(o.addedCount < o.removed.length) {
								for(var i = 0, len = o.removed.length - o.addedCount; i < len ; i++) {
									//self.emit("change", o.object.length + i, null, null, data);
									//self.emit(o.object.length + i, null, null, data);
									changes[o.object.length - 1 + i] = null;
								}
							}
							//self.emit("change")
						break;
						case "update":
							var v = LatteObject.create(data[o.name]);
							
							if( v &&  !v.hasEvent("change",addEvent) ){
								v.on("change", addEvent);
							}
							//self.emit("change",o.name,  data[o.name], null, data);
							//self.emit(o.name, data[o.name], null, data);
							changes[o.name] = data[o.name];
							
						break;
					}
				});
				//console.log(os , changes);
				for(var i in changes) {
					self.emit("change", i, changes[i], null, data);
					self.emit(i, changes[i]);
				}
			});
		}else if(Array.prototype.__defineGetter__){
			
		}else{
			console.error("暂时没想到解决方案");
		}
		

	};

	latte_lib.inherits(LatteArray, latte_lib.events);

	module.exports = LatteObject;