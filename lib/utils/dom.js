(function(){
	this.getById = function(id) {
		return document.getElementById(id);
	}
	this.setAttribute = function(key, value) {

	}
	this.getAttribute = function(key) {

	}
	var XHTML_NS = "http://www.w3.org/1999/xhtml";
	this.createElement = function(tag, ns) {
		return document.createElementNS?
		document.createElementNS(ns || XHTML_NS, tag)
		: document.createElement(tag);
	}
	this.getDocumentHead = function(doc) {
		if(!doc) {
			doc = document;
		}
		return doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
	}
}).call(module.exports);