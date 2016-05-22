


	/**
		
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
		/**
	var Command = function(data, dom, controller) {
		var latteValue = dom.getAttribute("latte-value");
		var latteObject = LatteObject.create(data);
		if(latteValue) {
			dom.textContent = latte_lib.format.templateStringFormat(latteValue, data);
			console.log(latteValue, data, latte_lib.format.templateStringFormat(latteValue, data));	
			//console.log(latteValue, data, dom.textContent);
			latteObject.on("change", function() {
				dom.textContent = latte_lib.format.templateStringFormat(latteValue, data);
			});	
		}else if(dom.childNodes.length == 1 && dom.childNodes[0].nodeType == 3) {
			controller.textContent = dom.textContent;
			dom.setAttribute("latte-value", dom.textContent);
			dom.textContent = latte_lib.format.templateStringFormat(controller.textContent, data);				
			latteObject.on("change", function() {
				dom.textContent = latte_lib.format.templateStringFormat(controller.textContent, data);
			});			
		}

	};
	*/
	/**
		<p>{{name}}</p>
		<p latte-value="{{name}}"></p>
		单项绑定
		data -> view
		缺点是使用insertHTML 修改的话不会改变
	*/
	var Command = {};
	(function() {
				var forEachJSON = function(data, key, result) {
					for(var i in data) {
						
						if(latte_lib.isObject(data[i])) {
							var ckey = latte_lib.clone(key);
							ckey.push(i);
							forEachJSON(data[i], ckey, result);
						}else if(latte_lib.isArray(data[i])){
							var ckey = latte_lib.clone(key);
							ckey.push(i);
							forEachJSON(data[i], ckey, result);
						}else{
							var ckey = latte_lib.clone(key);
							ckey.push(i);
							result[ckey.join(".")] = data[i].toString();
						}
					}
				}
			var toJSON = function(data) {
				var result = {};
				var json = data.toJSON();
				forEachJSON(json,  [], result);	
				console.log(result);
				return result;
			}
		this.after = function(data, dom, controller) {
			var latteValue = dom.getAttribute("latte-value");
			var latteObject = LatteObject.create(data);

			var func = function(stringContent) {
				var keys = LatteObject.stringRegExp(stringContent);
				dom.textContent = latte_lib.format.templateStringFormat(stringContent, toJSON(data));
				keys.forEach(function(key) {
					controller.bind("data", key, function(value, oldValue) {
						dom.textContent = latte_lib.format.templateStringFormat(stringContent, toJSON(data));
					});
				});
			}
			
			if(latteValue) {
				func(latteValue);
			}else if(dom.childNodes.length == 1 && dom.childNodes[0].nodeType == 3) {
				//text 转换成 latte-value
				dom.setAttribute("latte-value", dom.textContent);
				func(dom.textContent);
			}

		}
	}).call(Command);
	
	module.exports = Command;