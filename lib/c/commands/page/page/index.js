(function() {
			var liHtml = require("./li.html")
				, divHtml = require("./div.html")
				, Dom = require("latte_dom/utils/dom.js"); 
		var doDom = function(dom) {
			dom.innerHTML = "";
			var ul = Dom.createElement("ul");
			dom.appendChild(ul);

			var contents = Dom.createElement("div");
			dom.appendChild(contents);
		}
	this.create = function(data, dom, controller) {
		var Controller = require("../../../controller.js");
		var dataName = dom.getAttribute("latte-page-data");
		
		var d = data.get(dataName);
		var list = data.get("page");
	
	
		var copy1 = dom.children[0], copy2 = dom.children[1];
		dom.removeChild(copy1); 
		dom.removeChild(copy2);
		doDom(dom);
		var doSelect = function(select) {
			var index = list.indexOf(select);
			d.set("select", index);
			select.set("selectClass", "select");
			select.set("show", true);
		}
		list.forEach(function(o, index) {
			//dom.children[0].appendChild(liHtml);
			var title = copy1.cloneNode(true);
			
			dom.children[0].appendChild(title);
		
			Controller.create(title, o);

			
			
				var click = o.get("click") || function() {
					
					var select = d.get("select");

					var old = list.get(select);
					if(old) {
						old.set("show", false);
						old.set("selectClass", "");
					}
					doSelect(this);
					
					
				};

			o.set("click", click);

			

			var content = copy2.cloneNode(true);
			
			dom.children[1].appendChild(content);
			Controller.create(content, o);
			
		});
		
		//	latte-class 没绑定怎么办
		controller.once("finish", function() {
			console.log("selecting.....", list);
			var select = list.get(d.get("select"));
			console.log(select._events.selectClass[0].toString());
			
			select.set("selectClass", "select");

			select.set("show", true);
		});
		
		
	}
}).call(module.exports);