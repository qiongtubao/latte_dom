		/**
			css 单项绑定
		*/
		var latte_lib = require("latte_lib");
		var Css = function(dom) {
			this.binds = {};
			this.dom = dom;
		};
		(function() {
			this.bind = function(value, key, o) {
				this.binds[value] = this.binds[value] || {};
				this.binds[value][key] = o;
			}
			this.set = function(key, value) {
				this.dom.style[key] = value;
			}
			this.change = function(k, v) {
				if(this.binds[k]) {
					var self = this;
					var change = {};
					change[k] = v;
					for(var i in this.binds[k]) {
						self.set(i, latte_lib.format.templateStringFormat(this.binds[k][i], change));
					}
				}
			}
		}).call(Css.prototype);
		(function() {
			this.create = function(cssString, dom) {
				var css = new Css(dom);
				if(latte_lib.isString(cssString)) {
					var cssPrototypes = cssString.split(";");
					cssPrototypes.forEach(function(cssPrototype) {
						var kv = cssPrototype.split(":");
						if(kv.length ==  2) {
							var key = kv[0];
							var value = kv[1];
							var openTag = value.indexOf("{{") ;
							if(openTag != -1) {
								var closeTag = value.indexOf("}}");

								var o = value.substring(openTag+2, closeTag);
							
								css.bind(o, key, value);
							}
						}
						
						
					});
				}
				return css;
			}
		}).call(Css);
		module.exports = Css;