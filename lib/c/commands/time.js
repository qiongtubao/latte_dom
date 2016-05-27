	/**
		<img latte-time="time"></img>
		1分钟进行刷新一次
		
	*/
	var LatteObject = require("../../m/data.js")
		, latte_lib = require("latte_lib");
	var Command = {};
	var timers = {};
	(function() {
		this.funcs = [];
		this.add = function(fn) {
			if(this.funcs.indexOf(fn) != -1) { return; } 
			this.funcs.push(fn);
			if(this.funcs.length == 1) { this.doTime();}
		}
		this.remove = function(fn) {
			var index = this.funcs.indexOf(fn);
			if(index != -1) {
				this.funcs.splice(index, 1);
			}
			if(this.funcs.length == 0 && this.timer) {
				clearTimeout(this.timer);
			}
		}
		this.start = function() {

		}

		this.doTime = function() {
			var self = this;
			this.timer = setTimeout(function() {
				var time = new Date();
				self.funcs.forEach(function(fun) {
					fun(time);
				});
				self.doTime();
			}, 1000 * 60);
		}
	}).call(timers);
	(function() {
		this.after = function(data, dom, controller) {
			var timeValueName = dom.getAttribute("latte-time");
			var latteObject = LatteObject.create(data);
			if(timeValueName) {
				var time = data.get(timeValueName);
				//var format = dom.getAttribute("format");
				//latte_lib.format.dateFormat(format, time);
				
				var doTime = function(nTime) {
					var cTime = (nTime.getTime() - time.getTime());
					if(cTime > 1000 * 60 * 60 * 24 * 3) {
						dom.innerHTML = latte_lib.format.dateFormat(time);
						timers.remove(doTime);
						return;
					}
					cTime = cTime/(60 * 1000);
					if(cTime > 60) {
						cTime = (cTime/60);
						if(cTime > 24) {
							cTime = cTime/24;
							if(cTime< 2) {
								return dom.innerHTML = "昨天";
							}else{
								return dom.innerHTML = "前天";
							}
						}else{
							
							dom.innerHTML = parseInt(cTime)+"小时前";
							return;
						}
					}else{
						
						dom.innerHTML = parseInt(cTime)+"分前";
						return;
					}
				};
				var nTime = new Date();
				if(nTime.getTime() - time.getTime() > 1000 * 60 * 60 * 24 * 3) {
					dom.innerHTML = latte_lib.format.dateFormat(time);
					return;
				}else{
					
					doTime(nTime);
					timers.add(doTime);
					controller.on("close", function() {
						timers.remove(doTime);
					});
				}

			};
			

		};
	}).call(Command);
	
	module.exports = Command;