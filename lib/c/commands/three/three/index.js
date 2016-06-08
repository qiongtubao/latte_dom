(function() {
	var Dom = require("../../../../utils/dom.js");
		var doDom = function(dom, index) {
			var ul = Dom.createElement("ul");
			dom.appendChild(ul);
			ul.className="ul"+index;
			return ul;
		}
	this.create = function(data, dom, controller) {
		var Controller = require("../../../controller.js");
		//var dataName = dom.getAttribute("latte-data");

		var copy1 = dom.children[0];

		dom.removeChild(copy1);
		var d = data;

	

		var doAllChild = function(data, dom, index) {
			/**
			var node = copy1.cloneNode(true);
			dom.appendChild(node);
			var childs = data.get("childs");
			if(childs) {
				//var click = data.get("click");
				var ulChild= doDom(dom);
				childs.forEach(function(o) {
					
					doChild(o, ulChild, index + 1);
				});

				
			}	
			*/
			data.forEach(function(o) {
				var li = Dom.createElement("li");
				var node = copy1.cloneNode(true);
				li.appendChild(node);
				dom.appendChild(li);
				Controller.create(li, o);
				var childs = o.get("childs");
				if(childs) {
					var ul = doDom(li, index+1);
					doAllChild(childs, ul, index+1);
					var ck = o.get("click");
					var click = function() {
						ck && ck();
						if(ul.style.display == "") {
							ul.style.display = "none";
						}else{
							ul.style.display = "";
						}
					}
					o.set("click", click);
				}
				
			});
			
		};
		doAllChild(d, doDom(dom, 0), 0);

	}
}).call(module.exports);