(function() {
	var self = this;
	var svgs = {};
	var SvgDom;
	var latte_lib = require("latte_lib");
	var SVG_NS = "http://www.w3.org/2000/svg";
	var getSvgDom = function() {
		if(SvgDom) { return SvgDom;}
		SvgDom = document.getElementById("latte-svg");
		if(SvgDom) { return SvgDom; }
		SvgDom = Dom.createElement("svg", SVG_NS);
		SvgDom.style.display = "none";
		document.body.appendChild(SvgDom);
		SvgDom.id = "latte-svg";
		return SvgDom;
	}
	this.addSvg = function(id, svg) {
		var SvgDom = getSvgDom();
		var symbol = Dom.createElement("symbol", SVG_NS);
		symbol.id = id;
		symbol.innerHTML = svg;
		SvgDom.appendChild(symbol);
	}
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
	
	this.loadRequire  = function(path, name, requireUrl) {
		svgs[path] = svgs[path] || {};
		svgs[path][name] = requireUrl;
	}
	var Dom = require("./dom.js");
	/**
		1.
		暂时不支持svg的script动画 因为display:none 会把动画打断导致 无法正常执行
	*/
	this.getDom = function(path, name, partnerDom) {
		//var basename = path.substring(0, path.indexOf(".svg"));
		var doc = document.getElementById(path+"#"+name);
		console.log(doc);
		if(!doc) {
			this.addSvg(path+"#"+name, require(svgs[path][name]));	
		}
		var use = latte_lib.format.templateStringFormat(
			"<use xlink:href='{{name}}' width={{width}} height={{height}}></use>",
			{
				name: "#"+path + "#"+name,
				width: Dom.getPro(partnerDom, "width"),
				height: Dom.getPro(partnerDom, "height")
			}
		);
		var svg = Dom.createElement("svg",SVG_NS);
		svg.innerHTML = use;
		return svg; 
	}
}).call(module.exports);