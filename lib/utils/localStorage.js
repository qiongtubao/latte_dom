(function(){
	this.set = function(key, value) {
		try{
			localStorage.setItem(key, value);
		}catch(oException) {
			if(oException.name == 'QuotaExceededError'){
				console.log('超出本地存储限额！');
				//如果历史信息不重要了，可清空后再设置
				localStorage.clear();
				localStorage.setItem(key,value);
			}
		}
		
	}
	this.get = function(key) {

		localStorage.getItem(key);
	}
	this.del = function(key) {
		localStorage.removeItem(key);
	}
	this.forEach = function(callback) {
		for(var i=localStorage.length - 1 ; i >=0; i-- ) {
			callback(
				localStorage.getItem(localStorage.key(i)),
				localStorage.key(i)
			);
		}
	}
	this.clear = function() {
		localStorage.clear();
	}
}).call(module.exports);