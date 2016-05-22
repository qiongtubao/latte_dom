

var Success = {

};
var latte_lib = require("latte_lib");
(function() {
		var html = require("./window.html");
		var doDom = function(dom) {
			var add = "";
			if(dom.getAttribute("latte-mask")) {
				add = '<div class="latte_dialog_success_mask" latte-show="show" ></div>'
			}
			dom.innerHTML = latte_lib.format.templateStringFormat(html, {
				innerHTML: dom.innerHTML
			})+add;

		}
		/**
			icon 问题 暂时想到使用SVG来解决 暂时未解决
		*/
		var addMoveEvent = function(element, data) {
			element.onmousedown=function(event){
				var obj=element.parentNode;
				//obj.style.zIndex=++maxZindex;
				var Port={x:event.clientX-obj.offsetLeft,y:event.clientY-obj.offsetTop};

				function mouseUp(event){
					if(element.releaseCapture){
						element.releaseCapture();
						element.onmouseup=null;
						element.onmousemove=null;
					}else{
						document.removeEventListener("mouseup",mouseUp,true);
						document.removeEventListener("mousemove",mouseMove,true);
						window.releaseEvents(Event.MOUSE_MOVE | Event.MOUSE_UP);
					}
				}
				function mouseMove(event){
					var left = 	event.clientX - Port.x;
					var top = event.clientY - Port.y;
					var minleft = data.minleft || 0;
					var mintop = data.mintop || 0;
					if(left < minleft){
						left = minleft;
					}else if(left + obj.offsetWidth > document.body.offsetWidth){
						left = document.body.offsetWidth - obj.offsetWidth;
					}
					data.set("left", left);
					if(top < mintop){
						top = mintop;
					}else if(top + obj.offsetHeight > document.documentElement.clientHeight){
						top = document.documentElement.clientHeight - obj.offsetHeight;
					}
					data.set("top", top);
					//obj.style.top = top+"px";
				}
				if(element.setCapture){
					element.setCapture();
					element.onmouseup = mouseUp;
					element.onmousemove = mouseMove;
				}else{
					document.addEventListener("mouseup",mouseUp,true);
					document.addEventListener("mousemove",mouseMove,true);
					window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
				}
				return false;
			}
		}

		var addChangeEvent = function(element, data) {
			element.onmousedown=function(event){
				var obj=element.parentNode;
				//obj.style.zIndex=++maxZindex;
				var Port = {
					x:obj.offsetLeft+obj.offsetWidth-event.clientX,
					y:obj.offsetTop+obj.offsetHeight-event.clientY
				};
				
				
				function mouseUp(event){ 			
					if(element.releaseCapture){
						element.releaseCapture();
						element.onmouseup=null;
						element.onmousemove=null;
					}else{
						document.removeEventListener("mouseup",mouseUp,true);
						document.removeEventListener("mousemove",mouseMove,true);
						window.releaseEvents(Event.MOUSE_MOVE | Event.MOUSE_UP);
					}
				}
				function mouseMove(event){
					var width = event.clientX+Port.x -obj.offsetLeft;
					var height = event.clientY+Port.y-obj.offsetTop;
					var minwidth = data.minwidth || 0;
					var minheight = data.minheight || element.offsetHeight + (data.topheight || 0);
					if(width < minwidth){
						width = minwidth;
					}else if(width+obj.offsetLeft > document.documentElement.clientWidth){
						width = document.documentElement.clientWidth-obj.offsetLeft;
					}
					obj.style.width = width+"px";
					if(height < minheight){
						height = minheight;
					}else if(height + obj.offsetTop > document.documentElement.clientHeight){
						height = document.documentElement.clientHeight-obj.offsetTop;
					}
					obj.style.height = height+"px";
					element.style.left=(width-(data.dragwidth ))+"px";
					element.style.top=(height-(data.dragheight ))+"px";
				}
				
				
				if(element.setCapture){
					element.setCapture();
					element.onmouseup = mouseUp;
					element.onmousemove = mouseMove;
				}else{
					document.addEventListener("mouseup",mouseUp,true);
					document.addEventListener("mousemove",mouseMove,true);
					window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
				}
				return false;
			}
		}
	this.create = function(data, dom) {
		var Controller = require("../../../controller.js");
		var dataName = dom.getAttribute("latte-window-data");

		doDom(dom);
		var head = dom.children[0].children[0];
		var bottom = dom.children[0].children[2];
		if(dataName) {

			var d = data.get(dataName);
			d.set("changeIcon", "system2.png#change");
			Controller.createChild(dom, d);
			
			addMoveEvent(head, d);
			addChangeEvent(bottom, d);
		}
		
	}
}).call(Success);
require("latte_dom/utils/css.js").importCssString(require("./window.css"), "latte_window_window_css");
module.exports = Success;