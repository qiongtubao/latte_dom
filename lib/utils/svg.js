(function() {
	var self = this;
	this.hasSvgString = function(id, doc) {
		doc = doc || document;
		return !!doc.getElementById(id);
	}
	this.importSvgString = function(svgText, id, doc) {
		doc = doc || document;
		if(id && self.hasSvgString(id, doc))
			return null;
		var svg;
		svg = Dom.createElement("svg");
		svg.innerHTML = (svgText);
		//style.innerHTML = cssText;
		if(id) {
			svg.id = id;
		}
		Dom.getDocumentHead(doc).appendChild(svg);
	}
	

	this.getDom = function(path, name, partnerDom) {
		
	}
}).call(module.exports);