(function(){
	var self = this;
	this.hasCssString = function(id, doc) {
		var index = 0, sheets;
		doc = doc || document;
		if(doc.createStyleSheet && (sheets = doc.styleSheets)) {
			while(index < sheets.length) {
				if(sheets[index++].owningElement.id==id) {
					return true;
				}
			}
		}else if((sheets = doc.getElementsByTagName("style"))) {
			while(index < sheets.length) {
				if(sheets[index++].id === id) {
					return true;
				}
			}
		}
		return false;
	}
	var Dom = require("./dom.js");
	this.importCssString = function(cssText, id, doc) {
		doc = doc || document;
		if(id && self.hasCssString(id, doc))
			return null;
		var style;
		if(doc.createStyleSheet) {
			style = doc.createStyleSheet();
			style.cssText = cssText;
			if(id) {
				style.owningElement.id = id;
			}
		} else {
			style = Dom.createElement("style");
			style.appendChild(doc.createTextNode(cssText));
			//style.innerHTML = cssText;
			if(id) {
				style.id = id;
			}
			Dom.getDocumentHead(doc).appendChild(style);
		}
	}
}).call(module.exports);