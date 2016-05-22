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
	this.getPro = function(dom, pro) {
		if(dom[pro]) {
			return dom[pro];	
		}

		var str = dom.style[pro];
		var index = str.indexOf("px") ;
		return str.substring(0,index);
	}

	var events = {};
	this.on = function(event, cb) {
		events[event] = events[event] || [];
		if(events[event].indexOf(cb) != -1){
			return;
		}
		events[event].push(cb);
		document.addEventListener(event, cb);
	}
	this.preventDefault = function(e) {
		e.preventDefault();
	}
	var self = this;
	this.stopDrop = function() {
		self.on("drapleave", self.preventDefault);
		self.on("drop", self.preventDefault);
		self.on("dragenter", self.preventDefault);
		self.on("dragover", self.preventDefault);
	}
}).call(module.exports);