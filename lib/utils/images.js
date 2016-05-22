

	var ImagesMap = {
		
	};
	var Images = {};
	(function() {
		this.loadRequire = function(url, otherName) {
			ImagesMap[(otherName||url)] = {
				urlData: require(url),
				infos: require(url+".json")
			}
		}
			
		this.getDom = function(path, name, partnerDom) {
			//console.log(ImagesMap);
			var Dom = require("./dom.js");
			if(ImagesMap[path]) {
				if(name) {
					var infos = ImagesMap[path].infos;
					var info = infos.childs[name];
					var width = Dom.getPro(partnerDom, "width");
					var height = Dom.getPro(partnerDom, "height");

					//console.log(width, height);
					var bs = width / info.width 
					var div = Dom.createElement("div");
					div.style.overflow = "hidden";
					div.style.position = "relative";
					div.style.width= "100%";
					div.style.height= "100%";
					var img = Dom.createElement("img");
					img.width = infos.width * bs ;
					//img.height = height;
					img.src = ImagesMap[path].urlData;
					img.style.position = "absolute";
					img.style.left = "-" + info.x * bs +"px";
					img.style.top = "-" + info.y * bs+ "px";

					/**
					img.style.clip = "rect(100px   300px   300px   100px)";
					*/
					div.appendChild(img);
					return div;
				}else{
					var img = Dom.createElement("img");
					
					img.src = ImagesMap[path].urlData;
					return img;
				}
			}
		}
		

	}).call(Images);
	
	module.exports = Images;