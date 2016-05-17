	var latte_lib = require("latte_lib");
	var LatteArray = function(data) {
		var self = this;
		this.data = [];

		var doEvent = function(name, value, oldValue) {
			var index = self.data.indexOf(this);
			self.emit(index + "." + name, value, oldValue, data);
			self.emit("change", index + "." + name, value, oldValue, data);
		}
		data.forEach(function(o, i) {
			var n = LatteObject.create(o);
			if(n) {
				n.on("change", doEvent);
				//console.log("equ",doEvent.bind(n) == doEvent.bind(n));
				self.data[i] = n;
			}else{
				self.data[i] = o;
			}
		});
		var set = function(key, value) {
			data[key] = value;
			var ov = self.data[key];
			var nv ;
			if(LatteObject.isLatteObject(ov)) {
				console.log(ov._events);
			}
				nv = LatteObject.create(value);
				if(nv) {
					nv.on("change", doEvent);
					self.data[key] = nv;
				}else{
					self.data[ key] = nv = value;					
				}
			return {
				ov: ov,
				nv: nv
			};
		}
		
		this.get = function(key) {
			if(key == "this" &&  !self.data[key]) {
				return self.data;
			}
			return self.data[key];
		}
		this._set = set;
		this.set = function(key, value) {
			var data = set(key, value);
			self.emit("set", key, data.nv, data.ov);
			self.emit("change", key, data.nv, data.ov);
		}
		this.push = function(o) {
			var key = self.data.length;
			var data = set(key, o);
			self.emit("push", key, data.nv);
			self.emit("change", key, data.nv);
		}
		this.pop = function() {
			var data = set(self.length - 1, null);
			self.data.pop();
			self.emit("pop",  data.ov);
			console.log(self);
			self.emit("change", self.length, null, data.ov);
		}


		this.shift = function() {
			var old = self.data.shift();
			old.off("change", doEvent);
			self.emit("shift", old);

			for(var i = 0, len = self.data.length; i < len; i++) {
				self.emit("change", i, self.data[i]);
			}
			self.emit("change", self.data.length, null);
		}
		this.unshift = function() {
			var args = Array.prototype.map.call(arguments, function(value) {
				var o = LatteObject.create(value);
				if(o) {
					o.on("change", doEvent);
				}
				return o || value;
			});
			self.data.unshift.apply(self.data, args);
			self.emit.apply(self, ["unshift"].concat(args));

			for(var i = 0, len = self.data.length; i < len; i++) {
				self.emit("change", i, self.data[i]);
			}
		}

		this.splice = function(startIndex, num) {
			var oLength = self.data.length;
			var adds = Array.prototype.splice.call(arguments, 2);
			console.log(adds);
			var addOs = adds.map(function(o) {
				var n = LatteObject.create(o);
				if(n) {
					n.on("change", doEvent);
				}
				return n || o;
			});

			self.data.splice.apply(self.data, [startIndex, num].concat(addOs));
			console.log(["splice",startIndex, num].concat(addOs));
			self.emit.apply(self,  ["splice", startIndex, num].concat(addOs));
			
			for(var i = 0, len = Math.max(oLength, self.data.length); i < len; i++) {
				self.emit("change", i, self.data[i]);
			}
		} 

		this.toJSON = function() {
			return data;
		}


		//this.concat 不改变原来数组的
		this.indexOf = function(data) {
			return self.data.indexOf(data);
		}
		this.forEach = function(callback) {
			self.data.forEach(callback);
		};

		Object.defineProperty(self, "length", {
			get: function() {
				return self.data.length;
			},
			set: function(value) {
				throw new Error("暂时没处理")
			}
		});



	};
	latte_lib.inherits(LatteArray, latte_lib.events);
	(function() {
		
	}).call(LatteArray.prototype);

	var LatteObject = function(data) {

		
			var self = this;
			this.childEvents = {};
			self.data = {};
			for(var i in data) {	
				//		
				var l = LatteObject.create(data[i]);
				if(l) {
					self.childEvents[i] = function(name, value, oldValue) {
						self.emit(i+"."+name, value, oldValue, data);
						self.emit("change", i+"."+name, value, oldValue, data);
					};
					l.on("change", self.childEvents[i]);	
					self.data[i] = l;
				}else{
					self.data[i] = data[i];
				}		
			}
				this.set = function(key, value) {
					
					var data = self._set(key, value);
					self.emit(key, data.nv, data.ov);
					self.emit("change", key, data.nv, data.ov);
				}
				this._set = function(key, value) {
					data[key] = value;
					var oldValue = self.data[key];
					if(LatteObject.isLatteObject(oldValue)) {
						self.data[key].off("change", self.childEvents[key]);
					}
					var nowValue = LatteObject.create(value);
					
					if(nowValue) {
						self.childEvents[key] = function(name, value, oldValue) {
							self.emit(i + "." + name, value, oldValue, self.data[key]);
							self.emit("change", i + "." + name, value, oldValue, self.data[key]);
						}
						nowValue.on("change", self.childEvents[key]);
						self.data[key] = nowValue;												
					}else{						
						nowValue = value;	
						self.data[key] = value;					
					}
					return {
						ov: oldValue,
						nv: nowValue
					};
				}
				this.get = function(key) {
					if(key == "this" && !self.data[key]) {
						return self;
					}
					return self.data[key];
				}
			

				this.toJSON = function() {
					return data;
				}
				
				
		
	};
	latte_lib.inherits(LatteObject, latte_lib.events);
	(function() {
		
	}).call(LatteObject.prototype);
	(function() {
		this.isLatteObject = function(data) {
			return data && (
				data.constructor == LatteObject || 
				data.constructor == LatteArray
			);
		}
		this.getType = function(data) {
			if(LatteObject.isLatteObject(data)) {
				return "LatteObject";
			}
			if(Array.isArray(data)) {
				return "Array";
			}
			if(data && data.constructor == Object) {
				return "Object";
			}
		}
		this.create = function(data) {
			switch(LatteObject.getType(data)) {
				case "LatteObject":
					return data;
				break;
				case "Array":
					return new LatteArray(data);
				break;
				case "Object":
					return new LatteObject(data);
				break;
				default:
					return null;
				break;
			}
			
		}
	}).call(LatteObject);
	module.exports = LatteObject;