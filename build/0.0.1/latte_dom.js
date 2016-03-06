(function() {

var LATTE_NAMESPACE = "latte";
var global = (function() {
	return this;
})();
if (!LATTE_NAMESPACE && typeof requirejs !== "undefined")
return;

var _define = function(module, deps, payload) {
    if (typeof module !== 'string') {
        if (_define.original)
            _define.original.apply(window, arguments);
        else {
            console.error('dropping module because define wasn\'t a string.');
            console.trace();
        }
        return;
    }

    if (arguments.length == 2)
        payload = deps;

    if (!_define.modules) {
        _define.modules = {};
        _define.payloads = {};
    }
    
    _define.payloads[module] = payload;
    _define.modules[module] = null;
};

var _require = function(parentId, module, callback) {
    if (Object.prototype.toString.call(module) === "[object Array]") {
        var params = [];
        for (var i = 0, l = module.length; i < l; ++i) {
            var dep = lookup(parentId, module[i]);
            if (!dep && _require.original)
                return _require.original.apply(window, arguments);
            params.push(dep);
        }
        if (callback) {
            callback.apply(null, params);
        }
    }
    else if (typeof module === 'string') {
        var payload = lookup(parentId, module);
        if (!payload && _require.original)
            return _require.original.apply(window, arguments);

        if (callback) {
            callback();
        }

        return payload;
    }
    else {
        if (_require.original)
            return _require.original.apply(window, arguments);
    }
};

var resolve = function(parentId, moduleName) {
    if(moduleName.charAt(0) == ".") {
        var ps = parentId.split("/");
        var base = ps.pop();
        //var paths = ps.join("/");
        var ms = moduleName.split("/");
        var n ;
        while((n = ms.shift())) {
          if(n == "..") {
            ps.pop();
          }else if(n != "."){
            ps.push(n);
          }
        }
        return ps.join("/");
    }
    return moduleName;

}

var normalizeModule = function(parentId, moduleName) {
    // normalize plugin requires
    if (moduleName.indexOf("!") !== -1) {
        var chunks = moduleName.split("!");
        return normalizeModule(parentId, chunks[0]) + "!" + normalizeModule(parentId, chunks[1]);
    }
    // normalize relative requires
    /*if (moduleName.charAt(0) == ".") {
        var base = parentId.split("/").slice(0, -1).join("/");
        moduleName = base + "/" + moduleName;

        while(moduleName.indexOf(".") !== -1 && previous != moduleName) {
            var previous = moduleName;
            moduleName = moduleName.replace(/\/\.\//, "/").replace(/[^\/]+\/\.\.\//, "");
        }
    }*/
    //console.log(parentId, moduleName);
    name = resolve(parentId, moduleName);
    //console.log(parentId, moduleName, name);
    return name;
};
var lookup = function(parentId, moduleName) {

    moduleName = normalizeModule(parentId, moduleName);

    var module = _define.modules[moduleName];
    if (!module) {
        module = _define.payloads[moduleName];
        if (typeof module === 'function') {
            var exports = {};
            var mod = {
                id: moduleName,
                uri: '',
                exports: exports,
                packaged: true
            };

            var req = function(module, callback) {
                return _require(moduleName, module, callback);
            };

            var returnValue = module(req, exports, mod, global);
            exports = returnValue || mod.exports;
            _define.modules[moduleName] = exports;
            delete _define.payloads[moduleName];
        }
        module = exports || module;
        if(!module && moduleName.indexOf("/index") == -1) {
            module = _define.modules[moduleName] = lookup(parentId, moduleName+"/index");
        }

    }
    if(!module) {
      console.log("unload error",parentId, moduleName);
    }
     _define.modules[moduleName]  = module;
    return module;
};

function exportWindow(ns) {
    var require = function(module, callback) {
        return _require("", module, callback);
    };    

    var root = global;
    if (ns) {
        if (!global[ns])
            global[ns] = {};
        root = global[ns];
    }

    if (!root.define || !root.define.packaged) {
        _define.original = root.define;
        root.define = _define;
        root.define.packaged = true;
    }

    if (!root.require || !root.require.packaged) {
        _require.original = root.require;
        root.require = require;
        root.require.packaged = true;
    }
}

exportWindow(LATTE_NAMESPACE);
    //window._require = require;
    
})();
latte.global = this;
this.define = latte.define;

latte.config = {};
(function() {
    this.config = {};
}).call(latte);
(function(define) { 'use strict';
	define("latte_lib/async", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		var latte_lib = require("./lib");
		if(!latte_lib) {
			console.log("no load lib");
		}
		/**
		*	@class async
		*	@namespace latte_lib
		*	@module basic
		*/
		(function() {
			var _self = this;
			this.setImmediate = latte_lib.setImmediate;
			/**
			*	单次执行
			*	@method only_once
			*	@static
			*	@param    {function}  fn   只执行一次的函数
			*	@public
			*	@async
			*	@since 0.0.1
			*	@example

					var async = require("latte_lib").async;
					var f = async.only_once(function(data) {
						log(data);
					});
					f("a");
					f("b");
					//"a"
					//error  callback was already called.
			*/
			var only_once = this.only_once = function(fn) {
				var called = false;
				return function() {
					if (called) throw new Error("Callback was already called.");
					called = true;
					fn.apply(_self, arguments);
				}
			};
			/**
			*	并行执行
			*	@method forEach
			*	@static
			*	@param   arr   {array}  需要被执行函数的数组
			*	@param   iterator  {function}  执行函数
			*	@param   callback  {function}  回调函数
			*	@async
			*	@since 0.0.1
			*	@example

					var async = require("latte_lib").async;
					var result = [];
					async.forEach([1,2,3,4], function(data, callback) {
						if(data == 3) {
							callback("is 3");
						}else{
							result.push(data * 2);
							callback();
						}
					}, function(err, data) {
						log(err); //is 3
						log(result);// [2,4]
					});

					var result2 = [];
					async.forEach([1,2,3,4], function(data, callback) {
						if(data == 3) {
							setTimeout(function() {
								callback("is 3");
							}, 1);
						}else{
							result2.push(data * 2);
							callback();
						}
					}, function(err, data) {
						log(err); //is 3
						log(result2);// [2,4,8]
					});
			*
			*/
			this.forEach = this.each = function(arr, iterator, callback) {
				callback = callback || function(){};
				if(!arr.length) {
					return callback();
				}
				var completed = 0;
				latte_lib.forEach(arr, function (x) {
		            iterator(x, only_once(done) );
		        });
		        function done(err) {
		          if (err) {
		              callback(err);
		              callback = function () {};
		          }
		          else {
		              completed += 1;
		              if (completed >= arr.length) {
		                  callback();
		              }
		          }
		        }
			};

			/**
				串行执行
				@method forEachSeries
				@static
				@param   arr   {array}  需要被执行函数的数组
				@param   iterator  {function}  执行函数
				@param   callback  {function}  回调函数
				@sync
				@since 0.0.1
				@example
					var async = require("latte_lib").async;
					var result = [];
					async.forEachSeries([1,2,3,4], function(data, callback) {
						if(data == 3) {
							callback("is 3");
						}else{
							result.push(data * 2);
							callback();
						}
					}, function(err, data) {
						log(err); //is 3
						log(result);// [2,4]
					});

					var result2 = [];
					async.forEachSeries([1,2,3,4], function(data, callback) {
						if(data == 3) {
							setTimeout(function() {
								callback("is 3");
							}, 1);
						}else{
							result2.push(data * 2);
							callback();
						}
					}, function(err, data) {
						log(err); //is 3
						log(result2);// [2,4,8]
					});
			*/
			this.forEachSeries = this.eachSeries = function(arr, iterator, callback) {
				callback = callback || function() {};
				if (!arr.length) {
		            return callback();
		        }
		        var completed = 0;
		        (function iterate() {
		            iterator(arr[completed], function (err) {
		                if (err) {
		                    callback(err);
		                    callback = function () {};
		                }
		                else {
		                    completed += 1;
		                    if (completed >= arr.length) {
		                        callback();
		                    }
		                    else {
		                        iterate();
		                    }
		                }
		            });
		        })();
			};

			this.forEachLimit = this.eachLimit = function(arr, limit, iterator, callback) {
				var fn = _eachLimit(limit);
	        	fn.apply(null, [arr, iterator, callback]);
			};

			var _eachLimit = function(limit) {
				return function(arr, iterator, callback) {
					callback = callback || function() {};
					if (!arr.length || limit <= 0) {
		                return callback();
		            }
		            var completed = 0;
		            var started = 0;
		            var running = 0;
	             	(function replenish () {
		                if (completed >= arr.length) {
		                    return callback();
		                }

		                while (running < limit && started < arr.length) {
		                    started += 1;
		                    running += 1;
		                    iterator(arr[started - 1], function (err) {
		                        if (err) {
		                            callback(err);
		                            callback = function () {};
		                        }
		                        else {
		                            completed += 1;
		                            running -= 1;
		                            if (completed >= arr.length) {
		                                callback();
		                            }
		                            else {
		                                replenish();
		                            }
		                        }
		                    });
		                }
		            })();
				};
			};

			var doParallel = function (fn) {
		        return function () {
		            var args = Array.prototype.slice.call(arguments);
		            return fn.apply(null, [_self.each].concat(args));
		        };
		    };

		    var doParallelLimit = function(limit, fn) {
		        return function () {
		            var args = Array.prototype.slice.call(arguments);
		            return fn.apply(null, [_eachLimit(limit)].concat(args));
		        };
		    };

		    var doSeries = function (fn) {
		        return function () {
		            var args = Array.prototype.slice.call(arguments);
		            return fn.apply(null, [_self.eachSeries].concat(args));
		        };
		    };

		    var _asyncMap = function(eachfn, arr, iterator, callback) {
		    	arr = latte_lib.map(arr, function(x, i) {
		    		return {
		    			index: i,
		    			value: x
		    		};
		    	});
		    	if (!callback) {
		            eachfn(arr, function (x, callback) {
		                iterator(x.value, function (err) {
		                    callback(err);
		                });
		            });
		        } else {
		            var results = [];
		            eachfn(arr, function (x, callback) {
		                iterator(x.value, function (err, v) {
		                    results[x.index] = v;
		                    callback(err);
		                });
		            }, function (err) {
		                callback(err, results);
		            });
		        }
		    };

		    this.map = doParallel(_asyncMap);
		    this.mapSeries = doSeries(_asyncMap);

		    var _mapLimit = function(limit) {
		        return doParallelLimit(limit, _asyncMap);
		    };

		    this.mapLimit = function(arr, limit, iterator, callback) {
		    	return _mapLimit(limit)(arr, iterator, callback);
		    };

		    this.inject = this.foldl = this.reduce = function(arr, memo, iterator, callback) {
		    	_self.eachSeries(arr, function(x, callback) {
		    		iterator(memo, x, function (err, v) {
		                memo = v;
		                callback(err);
		            });
		    	}, function (err) {
		            callback(err, memo);
		        });
		    };

		    this.foldr = this.reduceRight = function (arr, memo, iterator, callback) {
		        var reversed = latte_lib.map(arr, function (x) {
		            return x;
		        }).reverse();
		        _self.reduce(reversed, memo, iterator, callback);
		    };
		    var _filter = function (eachfn, arr, iterator, callback) {
		        var results = [];
		        arr = latte_lib.map(arr, function (x, i) {
		            return {index: i, value: x};
		        });
		        eachfn(arr, function (x, callback) {
		            iterator(x.value, function (v) {
		                if (v) {
		                    results.push(x);
		                }
		                callback();
		            });
		        }, function (err) {
		            callback(latte_lib.map(results.sort(function (a, b) {
		                return a.index - b.index;
		            }), function (x) {
		                return x.value;
		            }));
		        });
		    };

		    this.select = this.filter = doParallel(_filter);
	    	this.selectSeries = this.filterSeries = doSeries(_filter);

	    	var _reject = function (eachfn, arr, iterator, callback) {
		        var results = [];
		        arr = latte_lib.map(arr, function (x, i) {
		            return {index: i, value: x};
		        });
		        eachfn(arr, function (x, callback) {
		            iterator(x.value, function (v) {
		                if (!v) {
		                    results.push(x);
		                }
		                callback();
		            });
		        }, function (err) {
		            callback(latte_lib.map(results.sort(function (a, b) {
		                return a.index - b.index;
		            }), function (x) {
		                return x.value;
		            }));
		        });
		    };

		    this.reject = doParallel(_reject);
	 		this.rejectSeries = doSeries(_reject);

	 		var _detect = function (eachfn, arr, iterator, main_callback) {
		        eachfn(arr, function (x, callback) {
		            iterator(x, function (result) {
		                if (result) {
		                    main_callback(x);
		                    main_callback = function () {};
		                }
		                else {
		                    callback();
		                }
		            });
		        }, function (err) {
		            main_callback();
		        });
		    };

		    this.detect = doParallel(_detect);
		 	this.detectSeries = doSeries(_detect);

		 	this.any = this.some = function(arr, iterator, main_callback) {
		 		_self.each(arr, function (x, callback) {
		            iterator(x, function (v) {
		                if (v) {
		                    main_callback(true);
		                    main_callback = function () {};
		                }
		                callback();
		            });
		        }, function (err) {
		            main_callback(false);
		        });
		 	};

		 	this.all = this.every = function (arr, iterator, main_callback) {
		        _self.each(arr, function (x, callback) {
		            iterator(x, function (v) {
		                if (!v) {
		                    main_callback(false);
		                    main_callback = function () {};
		                }
		                callback();
		            });
		        }, function (err) {
		            main_callback(true);
		        });
		    };

		    this.sortBy = function (arr, iterator, callback) {
		        _self.map(arr, function (x, callback) {
		            iterator(x, function (err, criteria) {
		                if (err) {
		                    callback(err);
		                }
		                else {
		                    callback(null, {value: x, criteria: criteria});
		                }
		            });
		        }, function (err, results) {
		            if (err) {
		                return callback(err);
		            }
		            else {
		                var fn = function (left, right) {
		                    var a = left.criteria, b = right.criteria;
		                    return a < b ? -1 : a > b ? 1 : 0;
		                };
		                callback(null, latte_lib.map(results.sort(fn), function (x) {
		                    return x.value;
		                }));
		            }
		        });
		    };
		    /**
		    	自动 并行 如果有依赖的话等依赖好了在执行
		    	@method auto
		    	@static
		    	@param {json} tasks
				@param {function} callback
				@async
				@since 0.0.1
				@example

					var async = require("latte_lib").async;
					async.auto({
						a: ["c",function(callback) {
							log("a");
							callback(null,3);
						}],
						b: function(callback) {
							log("b");
							callback(null, 1);
						},
						c: function(callback) {
							log("c");
							callback(null, 2);
						},
						d: ["a", function(callback) {
							log("d");
							callback(null, 4);
						}]
					}, function(err, results) {
						log("err:",err);
						log("results:", results);// {"b":1,"c":2,"a":3,"d":4}
					});


					async.auto({
						a: ["c",function(callback) {
							log("a");
							callback("is 3", 3);
						}],
						b: function(callback) {
							log("b");
							callback(null, 1);
						},
						c: function(callback) {
							log("c");
							callback(null, 2);
						},
						d: ["a", function(callback) {
							log("d");
							callback(null, 4);
						}]
					}, function(err, results) {
						log("err:",err);	// is 3
						log("results:", results);// {"b":1,"c":2, "a":3}
					});
		    */
		    this.auto = function (tasks, callback) {
		        callback = callback || function () {};
		        var keys = latte_lib.keys(tasks);
		        var remainingTasks = keys.length
		        if (!remainingTasks) {
		            return callback();
		        }

		        var results = {};

		        var listeners = [];
		        var addListener = function (fn) {
		            listeners.unshift(fn);
		        };
		        var removeListener = function (fn) {
		            for (var i = 0; i < listeners.length; i += 1) {
		                if (listeners[i] === fn) {
		                    listeners.splice(i, 1);
		                    return;
		                }
		            }
		        };
		        var taskComplete = function () {
		            remainingTasks--
		            latte_lib.forEach(listeners.slice(0), function (fn) {
		                fn();
		            });
		        };

		        addListener(function () {
		            if (!remainingTasks) {
		                var theCallback = callback;
		                // prevent final callback from calling itself if it errors
		                callback = function () {};

		                theCallback(null, results);
		            }
		        });

		        latte_lib.forEach(keys, function (k) {
		            var task = latte_lib.isArray(tasks[k]) ? tasks[k]: [tasks[k]];
		            var taskCallback = function (err) {
		                var args = Array.prototype.slice.call(arguments, 1);
		                if (args.length <= 1) {
		                    args = args[0];
		                }
		                if (err) {
		                    var safeResults = {};
		                    latte_lib.forEach(latte_lib.keys(results), function(rkey) {
		                        safeResults[rkey] = results[rkey];
		                    });
		                    safeResults[k] = args;
		                    callback(err, safeResults);
		                    // stop subsequent errors hitting callback multiple times
		                    callback = function () {};
		                }
		                else {
		                    results[k] = args;
		                    latte_lib.setImmediate(taskComplete);
		                }
		            };
		            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
		            var ready = function () {
		                return latte_lib.reduce(requires, function (a, x) {
		                    return (a && results.hasOwnProperty(x));
		                }, true) && !results.hasOwnProperty(k);
		            };
		            if (ready()) {
		                task[task.length - 1](taskCallback, results);
		            }
		            else {
		                var listener = function () {
		                    if (ready()) {
		                        removeListener(listener);
		                        task[task.length - 1](taskCallback, results);
		                    }
		                };
		                addListener(listener);
		            }
		        });
		    };

		    this.retry = function(times, task, callback) {
		        var DEFAULT_TIMES = 5;
		        var attempts = [];
		        // Use defaults if times not passed
		        if (typeof times === 'function') {
		            callback = task;
		            task = times;
		            times = DEFAULT_TIMES;
		        }
		        // Make sure times is a number
		        times = parseInt(times, 10) || DEFAULT_TIMES;
		        var wrappedTask = function(wrappedCallback, wrappedResults) {
		            var retryAttempt = function(task, finalAttempt) {
		                return function(seriesCallback) {
		                    task(function(err, result){
		                        seriesCallback(!err || finalAttempt, {err: err, result: result});
		                    }, wrappedResults);
		                };
		            };
		            while (times) {
		                attempts.push(retryAttempt(task, !(times-=1)));
		            }
		            _self.series(attempts, function(done, data){
		                data = data[data.length - 1];
		                (wrappedCallback || callback)(data.err, data.result);
		            });
		        }
		        // If a callback is passed, run this as a controll flow
		        return callback ? wrappedTask() : wrappedTask
		    };

		    this.waterfall = function (tasks, callback) {
		        callback = callback || function () {};
		        if (!latte_lib.isArray(tasks)) {
		          var err = new Error('First argument to waterfall must be an array of functions');
		          return callback(err);
		        }
		        if (!tasks.length) {
		            return callback();
		        }
		        var wrapIterator = function (iterator) {
		            return function (err) {
		                if (err) {
		                    callback.apply(null, arguments);
		                    callback = function () {};
		                }
		                else {
		                    var args = Array.prototype.slice.call(arguments, 1);
		                    var next = iterator.next();
		                    if (next) {
		                        args.push(wrapIterator(next));
		                    }
		                    else {
		                        args.push(callback);
		                    }
		                    latte_lib.setImmediate(function () {
		                        iterator.apply(null, args);
		                    });
		                }
		            };
		        };
		        wrapIterator(_self.iterator(tasks))();
		    };

		    var _parallel = function(eachfn, tasks, callback) {
		        callback = callback || function () {};
		        if (latte_lib.isArray(tasks)) {
		            eachfn.map(tasks, function (fn, callback) {
		                if (fn) {
		                    fn(function (err) {
		                        var args = Array.prototype.slice.call(arguments, 1);
		                        if (args.length <= 1) {
		                            args = args[0];
		                        }
		                        callback.call(null, err, args);
		                    });
		                }
		            }, callback);
		        }
		        else {
		            var results = {};
		            eachfn.each(latte_lib.keys(tasks), function (k, callback) {
		                tasks[k](function (err) {
		                    var args = Array.prototype.slice.call(arguments, 1);
		                    if (args.length <= 1) {
		                        args = args[0];
		                    }
		                    results[k] = args;
		                    callback(err);
		                });
		            }, function (err) {
		                callback(err, results);
		            });
		        }
		    };
		    /**
		    	@method parallel
		    	@async
				@param {function[]} tasks
				@param {function} callback
				@example

					var async = require("latte_lib").async;
					async.parallel([
						function(cb) {
							cb(null, 1);
						},
						function(cb) {
							setTimeout(function() {
								cb("is 2");
							}, 1);
						},
						function(cb) {
							cb(null, 3);
						}
					],function(err, result) {
						log(err);  //is 2
						log(result);//[1,null,3]
					});
		    */

		    this.parallel = function (tasks, callback) {
		        _parallel({ map: _self.map, each: _self.each }, tasks, callback);
		    };

		    this.parallelLimit = function(tasks, limit, callback) {
		        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
		    };
		    /**
		    	@method series
		    	@async
				@param {function[]} tasks
				@param {function} callback
				@example

					var async = require("latte_lib").async;
					async.series([
						function(cb) {
							cb(null, 1);
						},
						function(cb) {
							setTimeout(function() {
								cb("is 2");
							}, 1);
						},
						function(cb) {
							cb(null, 3);
						}
					],function(err, result) {
						log(err);  //is 2
						log(result);//[1,null]
					});
		    */
		    this.series = function (tasks, callback) {
		        callback = callback || function () {};
		        if (latte_lib.isArray(tasks)) {
		            _self.mapSeries(tasks, function (fn, callback) {
		                if (fn) {
		                    fn(function (err) {
		                        var args = Array.prototype.slice.call(arguments, 1);
		                        if (args.length <= 1) {
		                            args = args[0];
		                        }
		                        callback.call(null, err, args);
		                    });
		                }
		            }, callback);
		        }
		        else {
		            var results = {};
		            _self.eachSeries(_keys(tasks), function (k, callback) {
		                tasks[k](function (err) {
		                    var args = Array.prototype.slice.call(arguments, 1);
		                    if (args.length <= 1) {
		                        args = args[0];
		                    }
		                    results[k] = args;
		                    callback(err);
		                });
		            }, function (err) {
		                callback(err, results);
		            });
		        }
		    };

		    this.iterator = function (tasks) {
		        var makeCallback = function (index) {
		            var fn = function () {
		                if (tasks.length) {
		                    tasks[index].apply(null, arguments);
		                }
		                return fn.next();
		            };
		            fn.next = function () {
		                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
		            };
		            return fn;
		        };
		        return makeCallback(0);
		    };

		    this.apply = function (fn) {
		        var args = Array.prototype.slice.call(arguments, 1);
		        return function () {
		            return fn.apply(
		                null, args.concat(Array.prototype.slice.call(arguments))
		            );
		        };
		    };

		    var _concat = function (eachfn, arr, fn, callback) {
		        var r = [];
		        eachfn(arr, function (x, cb) {
		            fn(x, function (err, y) {
		                r = r.concat(y || []);
		                cb(err);
		            });
		        }, function (err) {
		            callback(err, r);
		        });
		    };
		    this.concat = doParallel(_concat);
	    	this.concatSeries = doSeries(_concat);
	    	this.whilst = function (test, iterator, callback) {
		        if (test()) {
		            iterator(function (err) {
		                if (err) {
		                    return callback(err);
		                }
		                _self.whilst(test, iterator, callback);
		            });
		        }
		        else {
		            callback();
		        }
		    };

		    this.doWhilst = function (iterator, test, callback) {
		        iterator(function (err) {
		            if (err) {
		                return callback(err);
		            }
		            var args = Array.prototype.slice.call(arguments, 1);
		            if (test.apply(null, args)) {
		                _self.doWhilst(iterator, test, callback);
		            }
		            else {
		                callback();
		            }
		        });
		    };

		    this.until = function(test, iterator, callback) {
		    	if (!test()) {
		            iterator(function (err) {
		                if (err) {
		                    return callback(err);
		                }
		                _self.until(test, iterator, callback);
		            });
		        }
		        else {
		            callback();
		        }
		    };

		    this.doUntil = function (iterator, test, callback) {
		        iterator(function (err) {
		            if (err) {
		                return callback(err);
		            }
		            var args = Array.prototype.slice.call(arguments, 1);
		            if (!test.apply(null, args)) {
		                _self.doUntil(iterator, test, callback);
		            }
		            else {
		                callback();
		            }
		        });
		    };

		    this.queue = function (worker, concurrency) {
		        if (concurrency === undefined) {
		            concurrency = 1;
		        }
		        function _insert(q, data, pos, callback) {
		          if (!q.started){
		            q.started = true;
		          }
		          if (!_isArray(data)) {
		              data = [data];
		          }
		          if(data.length == 0) {
		             // call drain immediately if there are no tasks
		             return latte_lib.setImmediate(function() {
		                 if (q.drain) {
		                     q.drain();
		                 }
		             });
		          }
		          latte_lib.forEach(data, function(task) {
		              var item = {
		                  data: task,
		                  callback: typeof callback === 'function' ? callback : null
		              };

		              if (pos) {
		                q.tasks.unshift(item);
		              } else {
		                q.tasks.push(item);
		              }

		              if (q.saturated && q.tasks.length === q.concurrency) {
		                  q.saturated();
		              }
		              latte_lib.setImmediate(q.process);
		          });
		        }

		        var workers = 0;
		        var q = {
		            tasks: [],
		            concurrency: concurrency,
		            saturated: null,
		            empty: null,
		            drain: null,
		            started: false,
		            paused: false,
		            push: function (data, callback) {
		              _insert(q, data, false, callback);
		            },
		            kill: function () {
		              q.drain = null;
		              q.tasks = [];
		            },
		            unshift: function (data, callback) {
		              _insert(q, data, true, callback);
		            },
		            process: function () {
		                if (!q.paused && workers < q.concurrency && q.tasks.length) {
		                    var task = q.tasks.shift();
		                    if (q.empty && q.tasks.length === 0) {
		                        q.empty();
		                    }
		                    workers += 1;
		                    var next = function () {
		                        workers -= 1;
		                        if (task.callback) {
		                            task.callback.apply(task, arguments);
		                        }
		                        if (q.drain && q.tasks.length + workers === 0) {
		                            q.drain();
		                        }
		                        q.process();
		                    };
		                    var cb = only_once(next);
		                    worker(task.data, cb);
		                }
		            },
		            length: function () {
		                return q.tasks.length;
		            },
		            running: function () {
		                return workers;
		            },
		            idle: function() {
		                return q.tasks.length + workers === 0;
		            },
		            pause: function () {
		                if (q.paused === true) { return; }
		                q.paused = true;
		                q.process();
		            },
		            resume: function () {
		                if (q.paused === false) { return; }
		                q.paused = false;
		                q.process();
		            }
		        };
		        return q;
		    };

		    this.priorityQueue = function(worker, concurrency) {
		    	function _compareTasks(a, b){
	          return a.priority - b.priority;
	        };

	        function _binarySearch(sequence, item, compare) {
	          var beg = -1,
	              end = sequence.length - 1;
	          while (beg < end) {
	            var mid = beg + ((end - beg + 1) >>> 1);
	            if (compare(item, sequence[mid]) >= 0) {
	              beg = mid;
	            } else {
	              end = mid - 1;
	            }
	          }
	          return beg;
	        }

	        function _insert(q, data, priority, callback) {
				if (!q.started){
					q.started = true;
				}
				if (!_isArray(data)) {
					data = [data];
				}
				if(data.length == 0) {
				// call drain immediately if there are no tasks
					return latte_lib.setImmediate(function() {
						if (q.drain) {
							q.drain();
						}
					});
				}
				  latte_lib.forEach(data, function(task) {
				      var item = {
				          data: task,
				          priority: priority,
				          callback: typeof callback === 'function' ? callback : null
				      };

				      q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

				      if (q.saturated && q.tasks.length === q.concurrency) {
				          q.saturated();
				      }
				      latte_lib.setImmediate(q.process);
				  });
				}

		        // Start with a normal queue
		        var q = _self.queue(worker, concurrency);

		        // Override push to accept second parameter representing priority
		        q.push = function (data, priority, callback) {
		          _insert(q, data, priority, callback);
		        };

		        // Remove unshift function
		        delete q.unshift;

		        return q;
		    };

		    this.cargo = function (worker, payload) {
		        var working     = false,
		            tasks       = [];

		        var cargo = {
		            tasks: tasks,
		            payload: payload,
		            saturated: null,
		            empty: null,
		            drain: null,
		            drained: true,
		            push: function (data, callback) {
		                if (!latte_lib.isArray(data)) {
		                    data = [data];
		                }
		                latte_lib.forEach(data, function(task) {
		                    tasks.push({
		                        data: task,
		                        callback: typeof callback === 'function' ? callback : null
		                    });
		                    cargo.drained = false;
		                    if (cargo.saturated && tasks.length === payload) {
		                        cargo.saturated();
		                    }
		                });
		                latte_lib.setImmediate(cargo.process);
		            },
		            process: function process() {
		                if (working) return;
		                if (tasks.length === 0) {
		                    if(cargo.drain && !cargo.drained) cargo.drain();
		                    cargo.drained = true;
		                    return;
		                }

		                var ts = typeof payload === 'number'
		                            ? tasks.splice(0, payload)
		                            : tasks.splice(0, tasks.length);

		                var ds = latte_lib.map(ts, function (task) {
		                    return task.data;
		                });

		                if(cargo.empty) cargo.empty();
		                working = true;
		                worker(ds, function () {
		                    working = false;

		                    var args = arguments;
		                    latte_lib.forEach(ts, function (data) {
		                        if (data.callback) {
		                            data.callback.apply(null, args);
		                        }
		                    });

		                    process();
		                });
		            },
		            length: function () {
		                return tasks.length;
		            },
		            running: function () {
		                return working;
		            }
		        };
		        return cargo;
		    };

		    var _console_fn = function (name) {
		        return function (fn) {
		            var args = Array.prototype.slice.call(arguments, 1);
		            fn.apply(null, args.concat([function (err) {
		                var args = Array.prototype.slice.call(arguments, 1);
		                if (typeof console !== 'undefined') {
		                    if (err) {
		                        if (console.error) {
		                            console.error(err);
		                        }
		                    }
		                    else if (console[name]) {
		                        latte_lib.forEach(args, function (x) {
		                            console[name](x);
		                        });
		                    }
		                }
		            }]));
		        };
		    };
		    this.log = _console_fn('log');
	 		this.dir = _console_fn('dir');

	 		this.memoize = function (fn, hasher) {
		        var memo = {};
		        var queues = {};
		        hasher = hasher || function (x) {
		            return x;
		        };
		        var memoized = function () {
		            var args = Array.prototype.slice.call(arguments);
		            var callback = args.pop();
		            var key = hasher.apply(null, args);
		            if (key in memo) {
		                latte_lib.nextTick(function () {
		                    callback.apply(null, memo[key]);
		                });
		            }
		            else if (key in queues) {
		                queues[key].push(callback);
		            }
		            else {
		                queues[key] = [callback];
		                fn.apply(null, args.concat([function () {
		                    memo[key] = arguments;
		                    var q = queues[key];
		                    delete queues[key];
		                    for (var i = 0, l = q.length; i < l; i++) {
		                      q[i].apply(null, arguments);
		                    }
		                }]));
		            }
		        };
		        memoized.memo = memo;
		        memoized.unmemoized = fn;
		        return memoized;
		    };

		    this.unmemoize = function (fn) {
				return function () {
					return (fn.unmemoized || fn).apply(null, arguments);
				};
		    };

		    this.times = function (count, iterator, callback) {
		        var counter = [];
		        for (var i = 0; i < count; i++) {
		            counter.push(i);
		        }
		        return _self.map(counter, iterator, callback);
		    };

		    this.timesSeries = function (count, iterator, callback) {
		        var counter = [];
		        for (var i = 0; i < count; i++) {
		            counter.push(i);
		        }
		        return _self.mapSeries(counter, iterator, callback);
		    };

		    /**
		    	@method seq
		    	@static
		    	@async
		    	@param  {function[]}     functions
		    	@return {function}
		    	@since 0.0.1
				@example

					var async = require("latte_lib").async;
					var fun = async.seq(function(a, callback) {
						log("1",a);//2
						callback(null, a+1, a-1);
					}, function(data1, data2, callback) {
						log("2",data1,data2);//3,1
						callback("is 2", (data1 + data2 + 2) / (data1- data2 + 2) );
					});
					fun(2, function(err,b,c) {
						log(err ,b,c);//is 2, 1.5
					});

		    */

		    this.seq = function (/* functions... */) {
		        var fns = arguments;
		        return function () {
		            var that = this;
		            var args = Array.prototype.slice.call(arguments);
		            var callback = args.pop();
		            _self.reduce(fns, args, function (newargs, fn, cb) {
		                fn.apply(that, newargs.concat([function () {
		                    var err = arguments[0];
		                    var nextargs = Array.prototype.slice.call(arguments, 1);
		                    cb(err, nextargs);
		                }]))
		            },
		            function (err, results) {
		                callback.apply(that, [err].concat(results));
		            });
		        };
		    };

		    this.compose = function (/* functions... */) {
		    	//颠倒参数
		      return _self.seq.apply(null, Array.prototype.reverse.call(arguments));
		    };

		    var _applyEach = function (eachfn, fns /*args...*/) {
		        var go = function () {
		            var that = this;
		            var args = Array.prototype.slice.call(arguments);
		            var callback = args.pop();
		            return eachfn(fns, function (fn, cb) {
		                fn.apply(that, args.concat([cb]));
		            },
		            callback);
		        };
		        if (arguments.length > 2) {
		            var args = Array.prototype.slice.call(arguments, 2);
		            return go.apply(this, args);
		        }
		        else {
		            return go;
		        }
		    };
		    this.applyEach = doParallel(_applyEach);
	    	this.applyEachSeries = doSeries(_applyEach);

	    	/**
	    		循环执行出现错误停止

	    		@method forever
				@static
				@param   fn   {function}  循环执行到函数
				@param   callback  {function}  循环执行出现错误之后回调函数
				@example

					var async = require("latte_lib").async;
					var i = 0;
					async.forever(function(next) {
						if(++i == 3)  {
							next("is 3");
						}else{
							log("forever", i);
							next();
						};

					}, function(err) {
						log(err);
					});
	    	*/
	    	this.forever = function (fn, callback) {
		        function next(err) {
		            if (err) {
		                if (callback) {
		                    return callback(err);
		                }
		                throw err;
		            }
		            fn(next);
		        }
		        next();
		    };
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_lib/coding/base64", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
			/**
				@namespace latte_lib
				@module coding
			  @class base64
			 */
			(function() {
				var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

					/**
						@method encode
						@param {String} input
						@return {String} output
						@example
							var Base64 = require("latte_lib").base64;
							log(Base64.encode("latte的世界"));
					*/
					this.encode = function (input) {
							var output = "";
							var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
							var i = 0;
							input = require("./utf8").encode(input);
							//input = _utf8_encode(input);
							while (i < input.length) {
									chr1 = input.charCodeAt(i++);
									chr2 = input.charCodeAt(i++);
									chr3 = input.charCodeAt(i++);
									enc1 = chr1 >> 2;
									enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
									enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
									enc4 = chr3 & 63;
									if (isNaN(chr2)) {
											enc3 = enc4 = 64;
									} else if (isNaN(chr3)) {
											enc4 = 64;
									}
									output = output +
									_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
									_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
							}
							return output;
					}

					/**
						@method decode
						@param {String} input
						@return {String} output
						@example
							var Base64 = require("latte_lib").base64;
							log(Base64.decode("bGF0dGXnmoTkuJbnlYw="));
					*/
					this.decode = function (input) {
							var output = "";
							var chr1, chr2, chr3;
							var enc1, enc2, enc3, enc4;
							var i = 0;
							input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
							while (i < input.length) {
									enc1 = _keyStr.indexOf(input.charAt(i++));
									enc2 = _keyStr.indexOf(input.charAt(i++));
									enc3 = _keyStr.indexOf(input.charAt(i++));
									enc4 = _keyStr.indexOf(input.charAt(i++));
									chr1 = (enc1 << 2) | (enc2 >> 4);
									chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
									chr3 = ((enc3 & 3) << 6) | enc4;
									output = output + String.fromCharCode(chr1);
									if (enc3 != 64) {
											output = output + String.fromCharCode(chr2);
									}
									if (enc4 != 64) {
											output = output + String.fromCharCode(chr3);
									}
							}
							output = require("./utf8").decode(output);
							//output = _utf8_decode(output);
							return output;
					}


			}).call(module.exports);
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/coding/hex", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		(function() {
			this.encode = function(string) {
			 	var HEX = "0123456789ABCDEF",  
				radix = 16,  
				len = string.length,  
				encodeStr = "";  
				for (var i = 0; i < len; i++) {  
					var num = parseInt(string.charCodeAt(i), 10);  
					encodeStr += "%" + Math.floor(num / radix) + HEX.charAt(num % radix);  
				}  
				return encodeStr;  
			}
			this.decode = function(string) {
				var arr = string.split("%"),  
				str = "";
				for (var i = 1; arr[i]; i++) {  
					str += String.fromCharCode(parseInt(arr[i], 16));  
				}  
				return str; 
			}
		}).call(module.exports);
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) { 'use strict';
	define("latte_lib/coding/utf8", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		/**
		*	@class utf8
		*	@namespace latte_lib
		*	@module coding
		*
		*/
		(function() {
			/**
			*	@property version
			*	@type String
			*/
			this.version = "0.0.1"
			var stringFromCharCode = String.fromCharCode;
			/**
			*	@method ucs2encode
			*	@param {int[]} array   8byte int[]
			*	@return {string} output   utf8String
			*	@since 0.0.1
			*	@sync
			*	@static
			*	@demo utf8.html {utf测试}
			*	@example
					var Utf8 = require("latte_lib").utf8;
					console.log(Utf8.ucs2encode([108,97,116,116,101,30340,19990,30028])) ;//"latte的世界"
			*/
			var ucs2encode = this.ucs2encode = function(array) {
				var length = array.length;
				var index = -1;
				var value;
				var output = '';
				while (++index < length) {
					value = array[index];
					if (value > 0xFFFF) {
						value -= 0x10000;
						output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
						value = 0xDC00 | value & 0x3FF;
					}
					output += stringFromCharCode(value);
				}
				return output;
			}
			/**
			*	@method ucs2decode
			*	@param {string} str    utf8String
			*	@return {int[]} output   8byte int[]
			*	@since 0.0.1
			*	@sync
			*	@static
			*	@example
					var Utf8 = require("latte_lib").utf8;
					console.log(Utf8.ucs2decode("latte的世界")) ;//[108,97,116,116,101,30340,19990,30028]
			*/
			var ucs2decode = this.ucs2decode = function (string) {
				var output = [];
				var counter = 0;
				var length = string.length;
				var value;
				var extra;
				while (counter < length) {
					value = string.charCodeAt(counter++);
					if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
						// high surrogate, and there is a next character
						extra = string.charCodeAt(counter++);
						if ((extra & 0xFC00) == 0xDC00) { // low surrogate
							output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
						} else {
							// unmatched surrogate; only append this code unit, in case the next
							// code unit is the high surrogate of a surrogate pair
							output.push(value);
							counter--;
						}
					} else {
						output.push(value);
					}
				}
				return output;
			}
			function createByte(codePoint, shift) {
				return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
			}

			function encodeCodePoint(codePoint) {
				if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
					return stringFromCharCode(codePoint);
				}
				var symbol = '';
				if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
					symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
				}
				else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
					symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
					symbol += createByte(codePoint, 6);
				}
				else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
					symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
					symbol += createByte(codePoint, 12);
					symbol += createByte(codePoint, 6);
				}
				symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
				return symbol;
			}
			/**
			*
			*	@method encode
			*	@param {string}  str   utf8string
			*	@return {string} byteString
			*	@since 0.0.1
			*   @static
			*	@sync
			*	@example
					var Utf8 = require("latte_lib").utf8;
					log(Utf8.encode("latte的世界")) ;//latteçä¸ç
			*
			*/
			var utf8encode = this.encode =  function(str) {
				var codePoints = ucs2decode(str);
				// console.log(JSON.stringify(codePoints.map(function(x) {
				// 	return 'U+' + x.toString(16).toUpperCase();
				// })));

				var length = codePoints.length;
				var index = -1;
				var codePoint;
				var byteString = '';
				while (++index < length) {
					codePoint = codePoints[index];
					byteString += encodeCodePoint(codePoint);
				}
				return byteString;
			}


			function readContinuationByte() {
				if (byteIndex >= byteCount) {
					throw Error('Invalid byte index');
				}

				var continuationByte = byteArray[byteIndex] & 0xFF;
				byteIndex++;

				if ((continuationByte & 0xC0) == 0x80) {
					return continuationByte & 0x3F;
				}

				// If we end up here, it’s not a continuation byte
				throw Error('Invalid continuation byte');
			}

			function decodeSymbol() {
				var byte1;
				var byte2;
				var byte3;
				var byte4;
				var codePoint;

				if (byteIndex > byteCount) {
					throw Error('Invalid byte index');
				}

				if (byteIndex == byteCount) {
					return false;
				}

				// Read first byte
				byte1 = byteArray[byteIndex] & 0xFF;
				byteIndex++;

				// 1-byte sequence (no continuation bytes)
				if ((byte1 & 0x80) == 0) {
					return byte1;
				}

				// 2-byte sequence
				if ((byte1 & 0xE0) == 0xC0) {
					var byte2 = readContinuationByte();
					codePoint = ((byte1 & 0x1F) << 6) | byte2;
					if (codePoint >= 0x80) {
						return codePoint;
					} else {
						throw Error('Invalid continuation byte');
					}
				}

				// 3-byte sequence (may include unpaired surrogates)
				if ((byte1 & 0xF0) == 0xE0) {
					byte2 = readContinuationByte();
					byte3 = readContinuationByte();
					codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
					if (codePoint >= 0x0800) {
						return codePoint;
					} else {
						throw Error('Invalid continuation byte');
					}
				}

				// 4-byte sequence
				if ((byte1 & 0xF8) == 0xF0) {
					byte2 = readContinuationByte();
					byte3 = readContinuationByte();
					byte4 = readContinuationByte();
					codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
						(byte3 << 0x06) | byte4;
					if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
						return codePoint;
					}
				}

				throw Error('Invalid UTF-8 detected');
			}

			var byteArray;
			var byteCount;
			var byteIndex;
			/**
			*	@method decode
			*	@sync
			*	@static
			*	@param {string}  byteString   bytes
			*	@return {string}
			*	@since 0.0.1
			*	@example
			*		var Utf8;
			*
			*		var Utf8 = require("latte_lib").utf8;
			*
			*
			*		console.log(Utf8.decode("latteçä¸ç")) ; //latte的世界
			*/
			var utf8decode = this.decode = function(byteString) {
				byteArray = ucs2decode(byteString);
				byteCount = byteArray.length;
				byteIndex = 0;
				var codePoints = [];
				var tmp;
				while ((tmp = decodeSymbol()) !== false) {
					codePoints.push(tmp);
				}
				return ucs2encode(codePoints);
			}



			// private method for UTF-8 encoding
			var _utf8_encode = function (string) {
					string = string.replace(/\r\n/g,"\n");
					var utftext = "";
					for (var n = 0; n < string.length; n++) {
							var c = string.charCodeAt(n);
							if (c < 128) {
									utftext += String.fromCharCode(c);
							} else if((c > 127) && (c < 2048)) {
									utftext += String.fromCharCode((c >> 6) | 192);
									utftext += String.fromCharCode((c & 63) | 128);
							} else {
									utftext += String.fromCharCode((c >> 12) | 224);
									utftext += String.fromCharCode(((c >> 6) & 63) | 128);
									utftext += String.fromCharCode((c & 63) | 128);
							}

					}
					return utftext;
			}

			// private method for UTF-8 decoding
			var _utf8_decode = function (utftext) {
					var string = "";
					var i = 0;
					var c = c1 = c2 = 0;
					while ( i < utftext.length ) {
							c = utftext.charCodeAt(i);
							if (c < 128) {
									string += String.fromCharCode(c);
									i++;
							} else if((c > 191) && (c < 224)) {
									c2 = utftext.charCodeAt(i+1);
									string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
									i += 2;
							} else {
									c2 = utftext.charCodeAt(i+1);
									c3 = utftext.charCodeAt(i+2);
									string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
									i += 3;
							}
					}
					return string;
			}
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/debug", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		var getLocation = function(str) {
				var at = str.toString().split("\n")[2];
				var data = at.substring(at.indexOf("(")+1, at.indexOf(")"));
				return data;
			}
		var disabled = window? !window.debug: process.argv.indexOf("-debug") == -1;
		var loggers = {};
		var logger = {};
		["log", "info", "error","warn"].forEach(function(type) {
			logger[type] = function() {
				if(disabled) {
					return;
				}
				var debug = new Error("debug");
				console[type].apply( console[type], [ getLocation(debug.stack)].concat( Array.prototype.slice.call(arguments)));
			}
		});
		module.exports = logger;

	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/events", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		var events;
		if(window) {
			/**
				@class events
				@namespace latte_lib
				@module basic
			*/
			var events = function() {
				this._events = this._events || {};
			};
			(events.interface = function() {
				/**
					@method on
					@public
					@param {String} event
					@param {Function} fn
					@return {events} this
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						events.on("hello", function() {
							log("latte");
						});
						events.emit("hello");
				*/
				this.on = this.addEventListener = function(event , fn) {
					this._events = this._events || {};
					(this._events[event] = this._events[event] || [])
						.push(fn);
					return this;
				};
				/**
					@method once
					@public
					@param {String} event
					@param {Function} fn
					@return {EventEmitter} this
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						events.once("hello", function() {
							log("latte");
						});
						events.emit("hello");
						events.emit("hello");
				*/
				this.once = function(event, fn) {
					var self = this;
					this._events = this._events || {};

					function on() {
						self.off(event, on);
						fn.apply(this, arguments);
					}

					on.fn = fn;
					this.on(event, on);
					return this;
				};
				/**
					@method off
					@public
					@param {String} event
					@param {Function} fn
					@return {EventEmitter} this
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						var fun = function() {
							log("latte");
						};
						events.once("hello", fun);
						events.emit("hello", fun);
				*/
				this.off =
				this.removeListener =
				this.removeAllListeners =
				this.removeEventListener = function(event, fn){
				  this._events = this._events || {};

				  // all
				  if (0 == arguments.length) {
				    this._events = {};
				    return this;
				  }

				  // specific event
				  var callbacks = this._events[event];
				  if (!callbacks) return this;

				  // remove all handlers
				  if (1 == arguments.length) {
				    delete this._events[event];
				    return this;
				  }

				  // remove specific handler
				  var cb;
				  for (var i = 0; i < callbacks.length; i++) {
				    cb = callbacks[i];
				    if (cb === fn || cb.fn === fn) {
				      callbacks.splice(i, 1);
				      break;
				    }
				  }
				  return this;
				};
				/**
					@method emit
					@public
					@param {String} event
					@return {EventEmitter} this
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						var fun = function() {
							log("latte");
						};
						events.on("hello", fun);
						event.emit("hello")
				*/
				this.emit = function(event){
					this._events = this._events || {};
					var args = [].slice.call(arguments, 1)
					, callbacks = this._events[event];

					if (callbacks) {
						callbacks = callbacks.slice(0);
						for (var i = 0, len = callbacks.length; i < len; ++i) {
						  callbacks[i].apply(this, args);
						}
					}

					return this;
				};
				/**
					@method listeners
					@public
					@param {String} event
					@return {Function[]}
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						var fun = function() {
							log("latte");
						};
						log(events.listeners("hello"));
				*/
				this.listeners = function(event){
					this._events = this._events || {};
					return this._events[event] || [];
				};
				/**
					@method hasListeners
					@public
					@param {String} event
					@return {Bool}
					@example

						var Events = require("latte_lib").events;
						var events = new Events();
						var fun = function() {
							log("latte");
						};
						log(events.hasListeners("hello"));
				*/
				this.hasListeners = function(event){
					return !! this.listeners(event).length;
				};
			}).call(events.prototype);
		}else{
			events = require("events").EventEmitter;
		}
		module.exports = events;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) {'use strict'
	define("latte_lib/format", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
		var latte_lib = require("./lib");
		/**
			@namespace latte_lib
			@class format
			@module basic
		*/
		(function() {
			var _self = this;
			/**
					@property ISO8601_FORMAT
					@type String
			*/
			this.ISO8601_FORMAT = "yyyy-MM-dd hh:mm:ss.SSS";
			/**
				@property ISO8601_WITH_TZ_OFFSET_FORMAT
				@type String
			*/
			this.ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ssO";
			/**
				@property DATETIME_FORMAT
				@type String
			*/
			this.DATETIME_FORMAT = "hh:mm:ss.SSS";
				function padWithZeros(vNumber, width) {
					var numAsString =  vNumber + "";
					while(numAsString.length < width) {
						numAsString = "0" + numAsString;
					}
					return numAsString;
				}
				function addZero(vNumber) {
					return padWithZeros(vNumber, 2);
				}
				function offset(date) {
					var os = Math.abs(date.getTimezoneOffset());
					var h = String(Math.floor(os/60));
					var m = String(os%60);
					if(h.length == 1) {
						h = "0" + h;
					}
					if(m.length == 1) {
						m = "0" + m;
					}
					return date.getTimezoneOffset() < 0 ? "+" + h + m : "-" + h + m;
				}
				/**
					@method getDateReplace
					@public
					@static
					@sync
					@param {Date} date
					@return {Object}
					@example
						var Format = require("latte_lib").format;
						var date = new Date();
						log(Format.getDateReplace(date));
				*/
				this.getDateReplace = function(date, prefix, postfix) {
					prefix = prefix ||  "";
					postfix = postfix || "";
					var vDay = addZero(date.getDate());
					var vMonth = addZero(date.getMonth() + 1);
					var vYearLong = addZero(date.getFullYear());
					var vYearShort = addZero(date.getFullYear().toString().substring(2,4));
					//var vYear = (format.indexOf("yyyy") > -1 ? vYearLong: vYearShort);
					var vHour = addZero(date.getHours());
					var vMinute = addZero(date.getMinutes());
					var vSecond = addZero(date.getSeconds());
					var vMillisecond = padWithZeros(date.getMilliseconds(), 3);
					var vTimeZone = offset(date);

					var result = {};
					result[prefix + "dd" + postfix] = vDay;
					result[prefix + "MM" + postfix] = vMonth;
					result[prefix + "yyyy" + postfix] = vYearLong;
					result[prefix + "y{1,4}" + postfix] = vYearShort;
					result[prefix + "hh" + postfix] = vHour;
					result[prefix + "mm" + postfix] = vMinute;
					result[prefix + "ss" + postfix] = vSecond;
					result[prefix + "SSS" + postfix] = vMillisecond;
					result[prefix + "O" + postfix] = vTimeZone;
					return result;
				}
				/**
					@method dateFormat
					@public
					@static
					@sync
					@param {String} format
					@param {Date} date
					@return {String} formatted
					@example
						var Format = require("latte_lib").format;
						var date = new Date();
						log(Format.dateFormat(Format.ISO8601_FORMAT, date));
				*/
			this.dateFormat = function(format, date) {
				if(!date) {
					date = format || new Date();
					format = exports.ISO8601_FORMAT;
				}
				var formatted = format;
				var json = _self.getDateReplace(date);
				latte_lib.jsonForEach(json, function(key, value) {
					formatted = formatted.replace(new RegExp(key,"g"), value);
				});
				return formatted;
			}
				var repeatStr = function(str, times) {
					var newStr = [];
					if(times > 0) {
						for(var i = 0; i < times; i++) {
							newStr.push(str);
						}
					}
					return newStr.join("");
				}
				var objFormat = function(object, level, jsonUti, isInArray) {
					var tab = isInArray ? repeatStr(jsonUti.t, level - 1): "";
					if(object === null || object === undefined) {
						return tab + "null";
					}
					switch(latte_lib.getClassName(object)) {
						case "array":
							var paddingTab = repeatStr(jsonUti.t , level - 1);
							var temp = [ jsonUti.n + paddingTab + "[" + jsonUti.n];
							var tempArrValue = [];
							for(var i = 0 , len = object.length; i < len; i++ ) {
								tempArrValue.push(objFormat(object[i], level + 1, jsonUti, true));
							}
							temp.push(tempArrValue.join("," + jsonUti.n));
							temp.push(jsonUti.n + paddingTab + "] ");
							return temp.join("");
						break;
						case "object":
							var currentObjStrings = [];
							for(var key in object) {
								if(object[key] == undefined) {
									continue;
								}
								var temp = [];
								var paddingTab = repeatStr(jsonUti.t, level);
								temp.push(paddingTab);
								temp.push("\"" + key +"\" : ");
								var value = object[key];
								temp.push(objFormat(value, level + 1, jsonUti));
								currentObjStrings.push(temp.join(""));
							}
							return (level > 1 && !isInArray ? jsonUti.n : "")
								+ repeatStr(jsonUti.t, level - 1) + "{" + jsonUti.n
								+ currentObjStrings.join("," + jsonUti.n)
								+ jsonUti.n + repeatStr(jsonUti.t , level - 1) + "}";
						break;
						case "number":
							return tab + object.toString();
						break;
						case "boolean":
							return tab + object.toString().toLowerCase();
						break;
						case "function":
							return "[Function]";
						break;
						default:
							return tab + ("\"" + object.toString() + "\"");
						break;
					}
				}
			/**
				@method jsonFormat
				@public
				@static
				@param {Object}
				@param {Object} default { n: "\n", t: "\t"}
				@return {String}
				@example
					var Format = require("latte_lib").format;
					log(Format.jsonFormat({
						a: "1",
						b: 2,
						c: [3],
						d: {
							e: 4
					}
				}));

			*/
				var defaultUti = { n: "\n", t: "\t"};
			this.jsonFormat = function(object, jsonUti) {
				jsonUti = latte_lib.merger(defaultUti, jsonUti);
				try {
					return objFormat(object, 1, jsonUti);
				}catch(e) {
					throw object;
					return JSON.stringify(object);
				}
			}
			/**
			 * @method templateStringFormat
				 @sync
				 @public
				 @param {String} template
				 @param  {Object} options
				 @return {String} data
				 @example
						var Format = require("latte_lib").format;
						log(Format.templateStringFormat("hello, {{name}}", { name: "latte"}));
			 */
			this.templateStringFormat = function(template, options) {
				var data = template;
				for(var i in options) {
					data = data.replace(new RegExp("{{"+i+"}}","igm"), options[i]);
				}
				return data;
			}
			this.templateJsonFormat = function(template, options) {
						var template = JSON.stringify(template);
						var data = _self.templateStringFormat(template, options);
						return JSON.parse(data);
			}
		}).call(module.exports);
  });
 })(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) {'use strict'
  define("latte_lib/index", ["require", "exports", "module", "window"],
  function(require, exports, module, window){
      /**
        @main
      */
      module.exports = require("./lib");
      (function() {
        if(!window) {
          this.fs = require("./old/fs");
        }
        this.utf8 = require("./coding/utf8");
        this.async = require("./async");
        this.events = require("./events");
        this.format = require("./format");
        this.removeIdle = require("./old/removeIdle");
        this.queue = require("./old/queue");
        this.base64 = require("./coding/base64");
        this.debug = require("./debug");
        this.xhr = require("./old/xhr");
      }).call(module.exports);
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 
	//'use strict';
	define("latte_lib/lib", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		/**
		*	@namespace latte_lib
		*	@class lib
			@module basic
		*
		*/
		(function() {
			var _self = this;
				function getFunctionName(func) {
				    if ( typeof func == 'function' || typeof func == 'object' ) {
				        var name = ('' + func).match(/function\s*([\w\$]*)\s*\(/);
				    }
				    return name && name[1];
				}
				_self.trace = console.trace || function trace (count) {        
					var caller = arguments.callee.caller;        
					var i = 0;        
					count = count || 10;        
					console.log("***----------------------------------------  ** " + (i + 1));        
					while (caller && i < count) {
					    console.log(caller.toString());
					    caller = caller.caller;            
					    i++;            
					    console.log("***----------------------------------------  ** " + (i + 1));        
					}    
				}
			
			/**
			*	@method nextTick
			*	@param {function} callback
			*	@async
			*	@static
			*	@all
			*	@example
					(function() {
						require("latte_lib").nextTick(function(){
							console.log("a");
						});
						console.log("b");
					})();
					//b
					//a
			*/
			this.setImmediate = this.nextTick = (function() {
				if(typeof process === "undefined" || !(process.nextTick)) {
	                if(window && typeof window.setImmediate === "function") {
	                    return window.setImmediate;
	                }else {
	                    return function(fn) {
	                        setTimeout(fn, 0);
	                    }
	                }
	            } else {
	                return process.nextTick;
	            }
			})();
			/**
			*
			*	@method inherits
			*	@param {class} ctor     class
			*	@param {class} superCtor    parentClass
			*	@sync
			*	@all
			*	@static
			*	@public
			*	@since 0.0.1
			*	@example
					var latte_lib = require("latte_lib");
					var A = function() {
						this.name = "a";
					};
					(function() {
						this.getName = function() {
							return this.name;
						}
					}).call(A.prototype);
					var B = function() {
						this.name = "b";
					}
					latte_lib.inherits(B, A);
					var b = new B();
					var a = new A();
					log(b.getName());//"b"
					log(a.getName());//"a";
			*/
			this.inherits = function(ctor, superCtor) {
				if(typeof Object.create === "function") {
	                ctor.super_ = superCtor
	                ctor.prototype = Object.create(superCtor.prototype, {
	                  constructor: {
	                    value: ctor,
	                    enumerable: false,
	                    writable: true,
	                    configurable: true
	                  }
	                });
	            } else {
	                ctor.super_ = superCtor
	                var TempCtor = function () {}
	                TempCtor.prototype = superCtor.prototype
	                ctor.prototype = new TempCtor()
	                ctor.prototype.constructor = ctor
	            }
			}
			/**
			*	@method forEach
			*	@static
			* 	@sync
			*	@all
			*	@since 0.0.1
			*	@public
			*	@param {class} ctor     class
			*	@param {class} superCtor    parentClass
			*	@example
					var latte_lib = require("latte_lib");
					var array = [1,2,3,4];
					var all = 0;
					latte_lib.forEach(array, function(key) {
							all += key;
					});
					log(all);//20
			*/
			this.forEach = function(arr, iterator) {
				if(arr.forEach) {
					return arr.forEach(iterator);
				}
				for(var i = 0 ,len = arr.length; i < len; i++) {
					iterator(arr[i], i, arr);
				}
			}
			/**
			*	@method keys
			*	@static
			*	@sync
			*	@all
			*	@since 0.0.1
			*	@public
			*	@param   {object} obj
			*	@return  {string[]} stringArray
			*	@example
					var latte_lib = require("latte_lib");
					var obj = { a: "a", b: "b"};
					var keys = latte_lib.keys(obj);
					log(keys);//["a","b"]
			*/
			this.keys = function(obj) {
				if(Object.keys) {
					return Object.keys(obj);
				}
				var keys = [];
				for(var k in obj) {
					if(obj.hasOwnProperty(k)) {
						keys.push(k);
					}
				}
				return keys;
			}

			/**
			* 	@method copyArray
			* 	@static
			*	@param {array} arr
			*	@return {array}
			*	@sync
			*	@public
			*	@since 0.0.1
			*
			*	@example
					var latte_lib = require("latte_lib");
					var array = ["1", "a"];
					var cArray = latte_lib.copyArray(array);
					log(cArray);//["1", "a"]
			*/
			this.copyArray = function(arr) {
				return arr.concat([]);
			}

			/**
			* 	@method indexOf
			* 	@static
			*	@param {object[] || string} arr
			*	@param {object}  obj
			*	@return {int}
			*	@sync
			*	@public
			*	@since 0.0.1
			*
			*	@example
					var latte_lib = require("latte_lib");
					var array = ["1", "a"];
					var cArray = latte_lib.indexOf(array, "1");
					log(cArray);//0
			*/
			this.indexOf = function(arr, obj) {
				if(arr.indexOf) return arr.indexOf(obj);
				for(var i = 0, len = arr.length; i < len; i++) {
					if(arr[i] === obj) return i;
				}
				return -1;
			}
			/**
				@method removeArray
				@static
				@param {object[]} 	arr
				@param {int}   start      0 start
				@param {int}	end
				@public
				@since 0.0.1
				@sync
				@return {object[]}  as
				@example

					var latte_lib = require("latte_lib");
					var arr = [1,2,3,4,5];
					var as = latte_lib.removeArray(arr, 2,3);
					log(as);//[1,2,5]
					log(arr);//[1,2,3,4,5]
			*/
			this.removeArray = function(arr, start, end) {
				var as = _self.copyArray(arr);
				_self.removeLocalArray(as, start, end);
				return as;
			}

			/**
			* 	@method removeLocalArray
			* 	@static
			*	@param {object[]} arr
			*	@param {int} start
			*	@param {int} end
			*	@public
			*	@since 0.0.1
			*	@sync
			*	@return {object[]} arr
				@example
					var latte_lib = require("latte_lib");
					var arr = [1,2,3,4,5];
					var as = latte_lib.removeLocalArray(arr, 2,3);
					log(as);//[1,2,5]
					log(arr);//[1,2,5]
			*/
			this.removeLocalArray = function(arr, start, end) {
				/**
					var rest = array.slice((end || start)+1);
					array.length = start < 0? array.length + start : start;
					return array;
				*/
				end = end || start;
				arr.splice(start , end - start+1);
				return arr;
			}
			/**
				@method inserLocalArray
				@static
				@public
				@sync
				@since 0.0.1
				@param {object[]} arr
				@param {int} index
				@param {object} obj
				@return {object[]} arr
				@example

					var latte_lib = require("latte_lib");
					var arr = [1,2,3,4,5];
					var as = latte_lib.inserLocalArray(arr, 2, 9);
					log(as);//[1,2,9,3,4,5]
					log(arr);//[1,2,9,3,4,5]
			*/
			this.inserLocalArray = function(arr, index, obj) {
				/*
					var rest = [node].concat(array.slice(index));
					array.length = index < 0? array.length + index: index;
					array.push.apply(array, rest);
					return array;
				*/
				arr.splice(index , 0 , obj);
				return arr;
			}

			/**
				@method copy
				@static
				@public
				@sync
				@since 0.0.1
				@param {object} obj
				@return {object} obj
				@example

					var latte_lib = require("latte_lib");
					var copy = latte_lib.copy({
						a: function() {

						},
						b: "1"
					});
					console.log(copy);
					//{ b : "1" }
			*/
			this.copy = function(obj) {
				return JSON.parse(JSON.stringify(obj));
			}
			/**
				@method clone
				@static
				@public
				@sync
				@since 0.0.1
				@param {object} obj
				@return {object} obj
				@example

					var latte_lib = require("latte_lib");
					var o = {
						a: function() {

						},
						b: "1"
					};
					var clone = latte_lib.clone(o);
					o.b = "2";
					console.log(clone);//{ a: function(){}, b: "1"}
					console.log(o);    //{ a: function(){}, b: "2"}
			*/
			this.clone = function(obj) {
				var o = {};
				for(var i in obj) {
					if(obj.hasOwnProperty(i)) {
						o[i] = obj[i];
					}
				}
				return o;
			}
			/**
				@method reduce
				@static
				@public
				@sync
				@since 0.0.1
				@param {object[]} arr
				@param {function} iterator
				@param {obj}  memo
				@return {obj} memo
				@example

					var latte_lib = require("latte_lib");
					var array = [1,2,3,4];
					var c = 0;
					var d = latte_lib.reduce(array, function(c, x, i, a) {
						return c + x;
					}, c);
					log(d);//10;
					log(c);//0;

			*/
			this.reduce = function(arr, iterator, memo) {
				if(arr.reduce) {
					return arr.reduce(iterator, memo);
				}
				_self.forEach(arr, function(x, i, a) {
					memo = iterator(memo, x, i, a);
				});
				return memo;
			}

			/**
				@method map
				@static
				@public
				@sync
				@param {object[]} arr
				@param {function} iterator
				@return {object[]} results;
				@since 0.0.1
				@example

					var latte_lib = require("latte_lib");
					var arr = [1,2,3,4];
					var as = latte_lib.map(arr, function(o) {
						return o+1;
					});
					log(as);//[2,3,4,5]
			*/
			this.map = function(arr, iterator) {
				if(arr.map) {
					return arr.map(iterator);
				}
				var results = [];
				_self.forEach(arr, function(x, i, a) {
					results.push(iterator(x, i, a));
				});
				return results;
			}
			/**
				@method jsonForEach
				@param {json} data
				@param {function} iterator
				@static
				@public
				@example
					var latte_lib = require("latte_lib");
					var data = {
						a: 1,
						b: "c",
						c: [1,2,3]
					};
					latte_lib.jsonForEach(data, function(key, value) {
						log(key, value);
					});
					//a   1
					//b   c
					//c   [1,2,3]
			*/
			this.jsonForEach = function(data, iterator) {
				this.keys(data).forEach(function(key) {
					iterator(key, data[key]);
				});
			}
			/**
				@method getChar
				@param {string} str
				@param {int} index
				@return  {string}
				@sync
				@public
				@static
				@example

					var latte_lib = require("latte_lib");
					var str = "abcde";
					var char = latte_lib.getChar(str, 1);
					log(char);//b
			*/
			this.getChar = function(str, index) {
				var strs = str.split("");
				return strs[index];
			}
			if(!Function.prototype.bind) {
				Function.prototype.bind = function(thisArg) {
					var args = Array.prototype.slice.call(arguments, 1);
					var self = this;
					return function() {
						self.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
					}
				}
			}

			/**
				@method	isArray
				@public
				@static
				@sync
				@param {objct}  obj
				@return {bool}
				@example

					var latte_lib = require("latte_lib");
					log( latte_lib.isArray(1) ); //false
					log( latte_lib.isArray([1,2,3]) ); //true
			*/
			this.isArray = function(obj) {
				if(Array.isArray) {
					return Array.isArray(obj);
				}else{
					throw "no handle isArray";
				}
			};

			/**
				@method isDate
				@static
				@public
				@sync
				@param {objct}  obj
				@return {bool}
				@example

					var latte_lib = require("latte_lib");
					log( latte_lib.isDate(1) ); //false
					var date = new Date();
					log( latte_lib.isDate(date) );	//true
			*/
			this.isDate = function(obj) {
				return obj.constructor == Date;
			};

			["String", "Function", "Boolean", "Number"].forEach(function(className) {
				_self["is"+className] = function(obj) {
	        		return typeof(obj) == className.toLowerCase();
	        	}
			});

			this.getClassName = function(obj) {
				var allClass = ["Array", "String", "Number", "Date", "Boolean","Function"];
				for(var i = 0, len = allClass.length; i < len; i++) {
					if(_self["is"+allClass[i]](obj)) {
						return allClass[i].toLowerCase();
					}
				}
				return "object";
			}


			/**
				@method merger
				@sync
				@static
				@public
				@param {object} master
				@param {...object} arguments{1, -1}
				@return {object} master
				@example

					var latte_lib = require("latte_lib");
					var a = latte_lib.merger({
						a: 1
					}, {
						b: 2
					});
					log(a);// {a: 1, b: 2}
			*/
			this.merger = function(master) {
				var master = _self.clone(master);
				Array.prototype.slice.call(arguments, 1).forEach(function(child) {
					if(!child) { return; }
					Object.keys(child).forEach(function(key) {
						master[key] = child[key];
					});
				});
				return master;
			}
			this.getErrorString = function(err) {
				if(err.stack) {
					return err.stack.toString();
				}else if(latte_lib.isString(err)) {
					return err.toString();
				}else{
						var errorString;
						try {
								errorString = JSON.stringify(err);
						}catch(e){
								var Util = require("util");
								errorString = Util.inspect(err);
						}
						return errorString;
				}
			}
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/old/blobBuilder", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var view = window;
		view.URL = view.URL || view.webkitURL;
		// if (view.Blob && view.URL) {
		// 	try {
		// 		new Blob;
		// 		return;
		// 	} catch (e) {}
		// }

		// Internally we use a BlobBuilder implementation to base Blob off of
		// in order to support older browsers that only have BlobBuilder
		var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || (function(view) {
			var
				  get_class = function(object) {
					return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
				}
				, FakeBlobBuilder = function BlobBuilder() {
					this.data = [];
				}
				, FakeBlob = function Blob(data, type, encoding) {
					this.data = data;
					this.size = data.length;
					this.type = type;
					this.encoding = encoding;
				}
				, FBB_proto = FakeBlobBuilder.prototype
				, FB_proto = FakeBlob.prototype
				, FileReaderSync = view.FileReaderSync
				, FileException = function(type) {
					this.code = this[this.name = type];
				}
				, file_ex_codes = (
					  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
					+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
				).split(" ")
				, file_ex_code = file_ex_codes.length
				, real_URL = view.URL || view.webkitURL || view
				, real_create_object_URL = real_URL.createObjectURL
				, real_revoke_object_URL = real_URL.revokeObjectURL
				, URL = real_URL
				, btoa = view.btoa
				, atob = view.atob

				, ArrayBuffer = view.ArrayBuffer
				, Uint8Array = view.Uint8Array

				, origin = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/
			;
			FakeBlob.fake = FB_proto.fake = true;
			while (file_ex_code--) {
				FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
			}
			// Polyfill URL
			if (!real_URL.createObjectURL) {
				URL = view.URL = function(uri) {
					var
						  uri_info = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
						, uri_origin
					;
					uri_info.href = uri;
					if (!("origin" in uri_info)) {
						if (uri_info.protocol.toLowerCase() === "data:") {
							uri_info.origin = null;
						} else {
							uri_origin = uri.match(origin);
							uri_info.origin = uri_origin && uri_origin[1];
						}
					}
					return uri_info;
				};
			}
			URL.createObjectURL = function(blob) {
				var
					  type = blob.type
					, data_URI_header
				;
				if (type === null) {
					type = "application/octet-stream";
				}
				if (blob instanceof FakeBlob) {
					data_URI_header = "data:" + type;
					if (blob.encoding === "base64") {
						return data_URI_header + ";base64," + blob.data;
					} else if (blob.encoding === "URI") {
						return data_URI_header + "," + decodeURIComponent(blob.data);
					} if (btoa) {
						return data_URI_header + ";base64," + btoa(blob.data);
					} else {
						return data_URI_header + "," + encodeURIComponent(blob.data);
					}
				} else if (real_create_object_URL) {
					return real_create_object_URL.call(real_URL, blob);
				}
			};
			URL.revokeObjectURL = function(object_URL) {
				if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
					real_revoke_object_URL.call(real_URL, object_URL);
				}
			};
			FBB_proto.append = function(data/*, endings*/) {
				var bb = this.data;
				// decode data to a binary string
				if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
					var
						  str = ""
						, buf = new Uint8Array(data)
						, i = 0
						, buf_len = buf.length
					;
					for (; i < buf_len; i++) {
						str += String.fromCharCode(buf[i]);
					}
					bb.push(str);
				} else if (get_class(data) === "Blob" || get_class(data) === "File") {
					if (FileReaderSync) {
						var fr = new FileReaderSync;
						bb.push(fr.readAsBinaryString(data));
					} else {
						// async FileReader won't work as BlobBuilder is sync
						throw new FileException("NOT_READABLE_ERR");
					}
				} else if (data instanceof FakeBlob) {
					if (data.encoding === "base64" && atob) {
						bb.push(atob(data.data));
					} else if (data.encoding === "URI") {
						bb.push(decodeURIComponent(data.data));
					} else if (data.encoding === "raw") {
						bb.push(data.data);
					}
				} else {
					if (typeof data !== "string") {
						data += ""; // convert unsupported types to strings
					}
					// decode UTF-16 to binary string
					bb.push(unescape(encodeURIComponent(data)));
				}
			};
			FBB_proto.getBlob = function(type) {
				if (!arguments.length) {
					type = null;
				}
				return new FakeBlob(this.data.join(""), type, "raw");
			};
			FBB_proto.toString = function() {
				return "[object BlobBuilder]";
			};
			FB_proto.slice = function(start, end, type) {
				var args = arguments.length;
				if (args < 3) {
					type = null;
				}
				return new FakeBlob(
					  this.data.slice(start, args > 1 ? end : this.data.length)
					, type
					, this.encoding
				);
			};
			FB_proto.toString = function() {
				return "[object Blob]";
			};
			FB_proto.close = function() {
				this.size = 0;
				delete this.data;
			};
			return FakeBlobBuilder;
		}(view));

		view.Blob = function(blobParts, options) {
			var type = options ? (options.type || "") : "";
			var builder = new BlobBuilder();
			if (blobParts) {
				for (var i = 0, len = blobParts.length; i < len; i++) {
					builder.append(blobParts[i]);
				}
			}
			return builder.getBlob(type);
		};
		module.exports = BlobBuilder;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) { 'use strict';
	define("latte_lib/old/buffer", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		if(window) {
			var utf8 = require("../coding/utf8");	

			var BufferPrototype = function() {
				function checkOffset(offset, ext, length) {
				  if ((offset % 1) !== 0 || offset < 0)
				    throw new RangeError('offset is not uint');
				  if (offset + ext > length)
				    throw new RangeError('Trying to access beyond buffer length');
				}
				function checkInt(buffer, value, offset, ext, max, min) {
				  if ((value % 1) !== 0 || value > max || value < min)
				    throw TypeError('value is out of bounds');
				  if ((offset % 1) !== 0 || offset < 0)
				    throw TypeError('offset is not uint');
				  if (offset + ext > buffer.length || buffer.length + offset < 0)
				    throw RangeError('Trying to write outside buffer length');
				}
				this.slice = function(start, end) {
					var array  = Array.prototype.slice.call(this, start, end);
					return new Buffer(array);
				};
				this.readInt32LE = function(offset, noAssert) {
					if (!noAssert)
	    				checkOffset(offset, 4, this.length);
					return (this[offset]) | 
					(this[offset + 1] << 8) |
					(this[offset + 2] << 16) |
					(this[offset + 3] << 24);
				}
				this.readInt16LE = function(offset, noAssert) {
					if (!noAssert)
	    				checkOffset(offset, 2, this.length);
					var val = this[offset] | (this[offset + 1] << 8);
					return (val & 0x8000)? val | 0xFFFF0000 : val;
				}
				this.writeInt32LE = function(value, offset, noAssert) {
					if (!noAssert)
	   					checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
					this[offset] = value;
					this[offset + 1] = (value >>> 8);
					this[offset + 2] = (value >>> 16);
					this[offset + 3] = (value >>> 24);
				}
				this.writeInt16LE = function(value, offset, noAssert) {	
					if (!noAssert)
	   					checkInt(this, value, offset, 2, 0x7fff, -0x8000);		
					this[offset] = value;
					this[offset + 1] = (value >>> 8);
				}
				this.copy = function(buff, start, meStart, meEnd) {
					var meStart = meStart || 0
						, meEnd = meEnd || this.length;
					for(var i = 0,len = meEnd - meStart; i <= len; i++) {
						buff[start + i] = this[meStart + i];
					}
				}
				this.toString = function(encoding, start, end ) {
					switch(encoding) {
						/*case "base64":
						
						break;*/
						default: 
						var string = utf8.ucs2encode(this);
						return string;
					}
					
				}
			};
			var  Buffer = function(data) {		
				var data = new Uint8Array(data);
				BufferPrototype.call(data);
				return data;
			};
			(function() {
				this.create = function(data) {
					if(typeof data === "string") {
						var data = utf8.ucs2decode(data);	
						var buffer = new Buffer(data.length);
						data.forEach(function(object, index) {
							buffer[index] = object;
						});
						return  buffer;
					}
				}
			}).call(Buffer);
			module.exports = Buffer;
		}else{
			module.exports = Buffer;
		}
		
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });	
(function(define) {'use strict'
  define("latte_lib/old/fs", ["require", "exports", "module", "window"],
  function(require, exports, module, window){
      var Fs = require("fs")
        , Path = require("path");
        /**
          @class fs
          @namespace latte_lib
          @module old
        */
      (function() {
        var self = this;
		for(var i in Fs) {
			self[i] = Fs[i]
		};
        this.exists = function(path, callback) {
          return Fs.exists(path, callback);
        }
        /**
        *  @method existsSync
        *  @static
        *  @public
        *  @sync
        *  @param {String} path 文件地址字符串
        *  @return {Bool}  exists   是否存在   存在为true；不存在为false
        *  @nodejs
          @example

            //@nodejs
            var Fs  = require("latte_lib");
            var exists = Fs.existsSync("./test.js");
            log(exists);
        */
        this.existsSync = function(path) {
          return Fs.existsSync(path);
        }
        /**
        *  @method mkdirSync
        *  @static
        *  @public
        *  @sync
        *  @param {String} path
        *  @param {Object} options
        *  @return {Error} error
        *  @nodejs
           @example
              //nodejs


        */
        this.mkdirSync = function(path, options) {
            if( self.existsSync(path)) {
              return null;
            }
            if(!self.existsSync(Path.dirname(path))) {
              var error = self.mkdirSync(Path.dirname(path), options);
              if(error) { return error; }
            }
            return Fs.mkdirSync(path, options);
        }
        /**
        *  @method writeFileSync
        *  @static
        *  @public
        *  @sync
        *  @param {String} path
        *  @param {String} data
        *  @return {Error} error
        *  @example
            //@nodejs

        */
        this.writeFileSync = function(path, data) {
          var error = self.mkdirSync(Path.dirname(path));
          if(error) { return error; }
          return Fs.writeFileSync(path, data, {encoding: "utf8"});
        }
        /**
          @method writeFile
          @static
          @public
          @sync
          @param {String} path
          @param {String} data
          @param {Function} callback
          @example
            //@nodejs
            var Fs = require("latte_lib").fs;
            Fs.writeFile("./test", test);
        */
        this.writeFile = function(path, data, callback) {
          self.mkdir(Path.dirname(path), null, function() {
  					Fs.writeFile(path, data, {encoding: "utf8"}, callback);
  				});
        }
        this.readFile = function(path, callback) {
          return Fs.readFile(path, function(err, buffer) {
              callback(err, buffer? buffer.toString(): null);
          });
        }
        this.readFileSync = function(path) {
          return Fs.readFileSync(path).toString();
        }
        this.mkdir = function(path, options, callback) {
          self.exists(path, function(exists) {
              if(exists) {
                callback(null, path);
              }else{
                self.mkdir(Path.dirname(path), options, function(err) {
                  if(err) { return callback(err); }
                  Fs.mkdir(path, options, callback);
                });
              }
          });
        }
        this.copyFile = function(fromPath, toPath, callback) {
          //@finding best function
          try {
            var from = Fs.createReadStream(fromPath);
            self.mkdir(Path.dirname(toPath), null, function(error) {
              var to = Fs.createWriteStream(toPath);
              from.pipe(to);
              callback(null);
            });
          }catch(e) {
            callback(e);
          }
        }

        this.copyDir = function(fromPath, toPath, callback) {

        }
        this.fileType = function(path) {
          return Path.extname(path).substring(1);
        }
        this.lstatSync = function(path) {
          return Fs.lstatSync(path);
        }
        this.readdirSync = function(path) {
          return Fs.readdirSync(path);
        }
        this.realpathSync = function(path, cache) {
          return Fs.realpathSync(path, cache);
        }
        this.appendFile = function(filename, data, options, callback) {
          return Fs.appendFile(filename, data, options, callback);
        }
        this.appendFileSync = function(filename, data, options) {
          return Fs.appendFile(filename, data, options);
        }
        /**
          @method deleteFileSync
          @static
          @sync
          @param {String} filename
          @param {Function} callback
          @example

            var Fs = require("latte_lib").fs;
            Fs.deleteFile("test", function(error) {
              console.log(error);
            });
        */
        this.deleteFile = function(filename, callback) {
          Fs.unlink(filename, callback);
        }
        /**
          @method deleteFileSync
          @static
          @sync
          @param {String} path
          @return {Error} error
          @example

            var Fs = require("latte_lib").fs;
            Fs.deleteFileSync("test");
        */
        this.deleteFileSync = function(path) {
            return Fs.unlinkSync(path);
        }
        this.stat = function(path, callback) {
            return Fs.stat(path, callback);
        }
        this.createReadStream = function(path, options) {
            return Fs.createReadStream(path, options);
        }
        this.createWriteStream = function(path, options) {
            var error = self.mkdirSync(Path.dirname(path));
            return Fs.createWriteStream(path, options);
        }

        this.rename = function(oldPath, newPath, callback) {
            return Fs.rename(oldPath, namePath, callback);
        }
        this.watch = function(filename, options, listener) {
            return Fs.watch(filename, options, listener);
        }
        this.statSync = function(filename) {
            return Fs.statSync(filename);
        }
        this.WriteStream = Fs.WriteStream;
      }).call(module.exports);
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/old/promise", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {

		(function() {
			this.defer = function() {
				var pending = [], value;
				return {
			        resolve: function (_value) {
			            if (pending) {
			                value = ref(_value);
			                for (var i = 0, ii = pending.length; i < ii; i++) {
			                    // XXX
			                    enqueue(function () {
			                        value.then.apply(value, pending[i]);
			                    });
			                }
			                pending = undefined;
			            }
			        },
			        promise: {
			            then: function (_callback, _errback) {
			                var result = defer();
			                _callback = _callback || function (value) {
			                    return value;
			                };
			                _errback = _errback || function (reason) {
			                    return reject(reason);
			                };
			                var callback = function (value) {
			                    result.resolve(_callback(value));
			                };
			                var errback = function (reason) {
			                    result.resolve(_errback(reason));
			                };
			                if (pending) {
			                    pending.push([callback, errback]);
			                } else {
			                    // XXX
			                    enqueue(function () {
			                        value.then(callback, errback);
			                    });
			                }
			                return result.promise;
			            }
			        }
			    };
			}

			this.ref = function(value) {
				if(value && value.then) {
					return value;
				}
				return {
					then: function(callback) {
						var result = defer();
						enqueue(function() {
							result.resolve(callback(value));
						});
						return result.promise;
					}
				};
			}
			this.reject = function(reason) {
				return {
					then: function(callback, errback) {
						var result = defer();
						enqueue(function() {
							result.resolve(errback(reason));
						});
						return result.promise;
					}
				}
			};
			this.when = function(value, _callback, _errback) {
				var result = defer();
				var done;
				_callback = _callback || function(value) {
					return value;
				}
				_errback = _errback || function(reason) {
					return reject(reason);
				}
				var callback = function(value) {
					try {
						return _callback(value);
					}catch(reason) {
						return reject(reason);
					}
				};
				var errback = function(reason) {
					try {
						return _errback(reason);
					} catch(reason) {
						return reject(reason);
					}
				};
				enqueue(function() {
					ref(value).then(function(value) {
						if(done) 
							return;
						done = true;
						result.resolve(ref(value).then(callback, errback));
					}, function(reason) {
						if(done) {
							return;
						}
						done = true;
						result.resolve(errback(reason));
					});
				});
				return result.promise;
			}
		}).call(module.exports);	
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });	
(function(define) {'use strict'
	define("latte_lib/old/queue", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
		/**
			@module old
			@namespace latte_lib
			@class queue
		*/

		function Queue(size) {
			this._size = Math.max(+size | 0, 1);
			this.slots = [];
			for(var i = 0; i < this._size; i++) {
				this.slots.push([]);
			}
		}
		(function(){
			/**
				@method size
				@return {Int} total
				@sync
				@example

					var Queue =  require("latte_lib").queue;
					console.log(Queue);
					var queue = new Queue();
					log(queue.size()); //0
			*/
			this.size = function() {
				if(this.total == null) {
					this.total = 0;
					for(var i = 0 ; i< this._size; i++) {
						this.total += this.slots[i].length;
					}
				}
				return this.total;
			}
			/**
				@method enqueue
				@param {Object} obj
				@param {Int} priority
				@example
					var Queue = require("latte_lib").queue;
					var q = new Queue(2);
					q.enqueue("1", 0);
					q.enqueue("2", 1);
					q.enqueue("3",0);
					log(q.size());//3
					log(q.dequeue());//1
					log(q.dequeue());//3
					log(q.dequeue());//2
			*/
			this.enqueue = function(obj, priority) {
				var priorityOrig;
				priority = priority && +priority | 0 || 0;
				this.total = null;
				if(priority) {
					priorityOrig = priority;
					if(priority < 0 || priority >= this._size) {
						priority = (this._size -1);
					}
				}
				this.slots[priority].push(obj);
			}
			/**
				@method dequeue
				@return {Object} obj
				@example
					var Queue = require("latte_lib").queue;
					var q = new Queue();
					var one = q.dequeue();
					log(one); //null
					q.enqueue("1");
					var two = q.dequeue();
					log(two); // 1

			*/
			this.dequeue = function() {
				var obj = null, sl = this.slots.length;
				this.total = null;
				for(var i = 0; i < sl; i++) {
					if(this.slots[i].length > 0) {
						obj = this.slots[i].shift();
						break;
					}
				}
				return obj;
			}
		}).call(Queue.prototype);
		module.exports = Queue;
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_lib/old/reconnection", ["require", "exports", "module", "window"], 
	function(require, exports, module, window) {
		var latte_lib = require("../lib");
		function Reconnection(config) {
			this.attempts = 0;
			this.reconnecting = config.reconnecting || false;//是否在重连
			this.openReconnect = true;//是否开启重启
			this.readyState = "close";
			this.reconnectionDelay = config.reconnectionDelay || 2000;
			this.reconnectionDelayMax = config.reconnectionDelayMax || 60*1000;
			
		};
		(function(){
			this.maybeReconnectOnOpen = function() {
				/*if(!this.openReconnect && !this.reconnecting && this._reconnection && this.attempts === 0) {
					this.openReconnect = true;
					this.reconnect();
				}*/
				if(!this.reconnecting && this.readyState.indexOf("close") != -1 && this.openReconnect) {
					this.reconnect();
				}
			}

			this.cleanup = function() {}
			this.onReconnect = function() {
				var attempt = this.attempts;
				this.attempts = 0;
				this.reconnecting = false;
			}
			this.reconnect = function () {
				if(this.reconnecting) return this;
				if(!this.openReconnect) return this;
				var self = this;
				if(this.attemptsMax && ++this.attempts > this.attemptsMax) {
					this.reconnecting = false;
					console.log("reconnecting_fail full");
				} else {
					var delay = this.attempts * this.reconnectionDelay;
					delay = Math.min(delay, this.reconnectionDelayMax);
					this.reconnecting = true;
					var timer = setTimeout(function() {
						self.open(function(err) {
							if(err) {
								self.reconnecting = false;
								self.reconnect();
							}else {
								self.onReconnect();
							}
						});
					}, delay);
				}
			}
			this.onClose = function(reason) {
				this.cleanup();
				this.readyState = "closed";
				//this.emit("close", reason);
				if(this.openReconnect) {
					this.reconnect();
				}
			}
		}).call(Reconnection.prototype);
		module.exports = Reconnection;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
(function(define) {'use strict'
	define("latte_lib/old/removeIdle", ["require", "exports", "module", "window"],
 	function(require, exports, module, window) {
		/**
			@module old
			@namespace latte_lib
			@class removeIdle
		*/
		function RemoveIdle(config) {
			this.reapIntervalMillis = config.reapIntervalMillis || 1000;
			this.idleTimeoutMillis = config.idleTimeoutMillis || 10000;
			this.refreshIdle = config.refreshIdle || true;
			this.returnToHead = config.returnToHead || false;
			this.scheduleRemoveIdle();
			this.min = config.min || 0;
			this.max = config.max || 1000;
			this.availableObjects = [];
			this._destroy = config.destroy || function() {};
			this._create = config.create;
			this.log = config.log || null;
		};
		(function() {
			/**
				forget the function 
			*/
			this.removeConditions = function() {	return true;}
			/**
				when clean a object after then do the function
				@interface

			*/
			this.ensureMinimum = function() {

			}
			/**
				when add a object after then do the function
				@interface

			*/
			this.dispense = function() {}
			/**
					@method getIdle
					@param {Object} obj
					@example
						var RemoveIdle = require("latte_lib").removeIdle;
						var r = new RemoveIdle({
									idleTimeoutMillis: 1000
						});
						var obj = "1";
						r.release(obj);
						log(r.size());//1
						r.getIdle(obj);
						log(r.size());//0


			*/
			this.getIdle = function(obj) {
				this.availableObjects = this.availableObjects.filter(function(objWithTimeout) {
					return (objWithTimeout.obj !== obj);
				});
			}
			/**
				@method size
				@return {Int}
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					log(r.size());//0
			*/
			this.size = function() {
				return this.availableObjects.length;
			}
			/**
				@method update
				@param {Object} obj
				@example

					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					var obj = {
							timeout: Date.now()-1,
							obj: "1"
					};
					setTimeout(function(){

							r.availableObjects.push(obj);
							setTimeout(function() {
									log("one", r.size());//one,1
									r.update(obj.obj);
									r.removeIdle();
									log("two",r.size());//two,1
									setTimeout(function(){
												log("three", r.availableObjects.length);//three,0
									},1000);
							}, 2000);
					}, 2000);

			*/
			this.update = function(obj) {
				for(var i =0 , len = this.availableObjects.length; (i < len && this.removeConditions());i++) {
    				if(obj == this.availableObjects[i].obj) {
    					this.availableObjects[i].timeout = new Date().getTime() + this.idleTimeoutMillis;
    				}
    			}
			}
			/**
				add obj in availableObjects
				@method release
				@param {Object} obj
				@public
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
						idleTimeoutMillis: 1000
					});
					r.release("1");
					log(r.size());//1
					setTimeout(function(){
						log(r.size());//0
					}, 1000);
			*/
			this.release = function(obj) {
				if(this.availableObjects.some(function(objWithTimeout) {
					if(objWithTimeout.obj === obj) {
						//续时
						objWithTimeout.timeout =  new Date().getTime() + this.idleTimeoutMillis;
						return true;
					}
				})) {
					this.log && this.log.error("called twice for the same resource")
					//刷新
					return;
				};
				var objWithTimeout = {obj: obj, timeout: (new Date().getTime() + this.idleTimeoutMillis)}
				if(this.returnToHead) {
					this.availableObjects.splice(0,0,objWithTimeout);
				} else{
					this.availableObjects.push(objWithTimeout);
				}
				this.dispense();
				this.scheduleRemoveIdle();
			}
			/**
				@method removeIdle
				@example

					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					//sleep 2000ms
					//when r.availableObjects.length == 0  then close autoClean;
					setTimeout(function(){
							r.availableObjects.push({
									timeout: Date.now()-1,
									obj: "1"
							});
							setTimeout(function() {
									log("one", r.size());//one,1
									r.removeIdle();
									log("two",r.size());//two,0
							}, 2000);
					}, 2000);

			*/
			this.removeIdle = function() {
				var toRemove = [],
    				now = new Date().getTime(),
    				self = this
    				timeout;
				this.removeIdleScheduled = false;
    			for(var i =0 , len = this.availableObjects.length; (i < len && this.removeConditions());i++) {
    				var timeout = this.availableObjects[i].timeout;
    				if(now > timeout) {
    					toRemove.push(this.availableObjects[i].obj);
    				}
    			}
    			for(var i = 0, len = toRemove.length; i < len; i++) {
    				self.destroy(toRemove[i]);
    			}
    			if(this.availableObjects.length > 0) {
    				this.scheduleRemoveIdle();
    			}
			}
			/**
				@method scheduledRemoveIdle
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					setTimeout(function(){
							r.availableObjects.push({
									timeout: Date.now()-1,
									obj: "1"
							});
							setTimeout(function() {
									log("one", r.size());//one,1
									r.scheduleRemoveIdle();
									log("two",r.size());//two,1
									setTimeout(function(){
												log("three", r.size());//three,0
									},1000);
							}, 2000);
					}, 2000);
			*/
			this.scheduleRemoveIdle = function() {
				if (!this.removeIdleScheduled) {
					this.removeIdleScheduled = true;
					this.removeIdleTimer = setTimeout(this.removeIdle.bind(this), this.reapIntervalMillis);
		    }
			}
			/**
				@method destroy
				@param {Object} obj
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});
					setTimeout(function(){
							r.availableObjects.push({
									timeout: Date.now()-1,
									obj: "1"
							});
							setTimeout(function() {
									log("one", r.size());//one,1
									r.destroy(r.availableObjects[0].obj);
									log("two",r.size());//two,1
							}, 2000);
					}, 2000);
			*/
			this.destroy = function(obj) {
				this.getIdle(obj);
				this._destroy(obj);
				this.ensureMinimum();
			}
			/**
				@method destroyAllNow
				@param {Function} callback
				@example
					var RemoveIdle = require("latte_lib").removeIdle;
					var r = new RemoveIdle({
								idleTimeoutMillis: 1000
					});

					r.availableObjects.push({
							timeout: Date.now()+ 60 * 60 * 1000,
							obj: "1"
					});
					setTimeout(function() {
							log("one", r.size());//one,1
							r.destroyAllNow();
							log("two",r.size());//two,0
					}, 2000);

			*/
			this.destroyAllNow = function(callback) {
				var willDie = this.availableObjects;
				this.availableObjects = [];
				var obj = willDie.shift();
				var self = this;
				while(obj !== null && obj !== undefined) {
					self.destroy(obj.obj);
					obj = willDie.shift();
				}
				this.removeIdleScheduled = false;
				clearTimeout(this.removeIdleTimer);
				if(callback) {
					callback();
				}
			}
		}).call(RemoveIdle.prototype);
		module.exports = RemoveIdle;
  });
})(typeof define === "function"? define: function(name, reqs, factory) {factory(require, exports, module); });

(function(define) { //'use strict';
	define("latte_lib/old/xhr", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
      var lib = require("../lib")
          , events = require("../events")
          , empty = function() {}
          , Request
          , XMLHttpRequest;
      var defaultHeaders = {

      };
      if(window) {
          XMLHttpRequest = window.XMLHttpRequest;
          Request = function(opts) {
              this.method = opts.method || "GET";
              this.uri = opts.uri;
              this.data = opts.data;
              this.async = false != opts.async;

              this.xd = !!opts.xd;
              this.xs = !!opts.xs;
              this.agent = opts.agent;
              this.enablesXDR = opts.enablesXDR;

              this.pfx = opts.pfx;
              this.key = opts.key;
              this.passphrase = opts.passphrase;
              this.cert = opts.cert;
              this.ca = opts.ca;
              this.ciphers = opts.ciphers;
              this.rejectUnauthorized = opts.rejectUnauthorized;

              this.headers = lib.merger(defaultHeaders, opts.headers);
              this.create();
          }
          lib.inherits(Request, events);
          (function() {
              this.create = function() {
                  var xhr = this.xhr = new XMLHttpRequest({
                      agent: this.agent,
                      xdomain: this.xd,
                      xscheme: this.xs,
                      enablesXDR: this.enablesXDR,
                      pfx: this.pfx,
                      key: this.key,
                      passphrase: this.passphrase,
                      cert: this.cert,
                      ca: this.ca,
                      ciphers: this.ciphers,
                      rejectUnauthorized: this.rejectUnauthorized
                  });
                  var self = this;
                  try {
                     xhr.open(this.method, this.uri, this.async);
                     if("withCredentials" in xhr) {
                        xhr.withCredentials = true;
                     }
                     try {
                          if(this.headers) {
                              //xhr.setDisableHeaderCheck(true);
                              for(var i in this.headers) {
                                  if(this.headers.hasOwnProperty(i)) {
                                      xhr.setRequestHeader(i, this.headers[i]);
                                  }
                              }
                          }
                     }catch(e) {
                        console.log("setHeader error", e);
                     }
                     if(this.hasXDR()) {
                        xhr.onload = function() {
                            self.onLoad();
                        }
                        xhr.onerror = function() {
                            self.onError(xhr.responseText);
                        }
                     } else {
                        xhr.onreadystatechange = function() {
                            if(4 != xhr.readyState) return;
                            if(200 == xhr.status || 1223 == xhr.status) {
                                self.onLoad();
                            }else{
                                lib.nextTick(function(){
                                    self.onError(xhr.status);
                                });
                            }
                        }
                     }
                     xhr.send(this.data);
                  } catch(e) {
                      return lib.nextTick(function() {
                            self.onError(e);
                      });
                  }
                  if(Request.requests) {
                      this.index = Request.requests.requestsCount++;
                      Request.requests[this.index] = this;
                  }
              }

              this.onSuccess = function() {
                  this.emit("success");
                  this.cleanup();
              };

              this.onData = function(data) {
                  this.emit("data", data);
                  this.onSuccess();
              };

              this.onError = function(err) {
                  this.emit("error", err);
                  this.cleanup(true);
              }

              this.cleanup = function(fromError) {
                  if("undefined" == typeof this.xhr || null == this.xhr) {
                      return;
                  }
                  if(this.hasXDR()) {
                      this.xhr.onload = this.xhr.onerror = empty;
                  }else{
                      this.xhr.onreadystatechange = empty;
                  }
                  if(fromError) {
                      try {
                          this.xhr.abort();
                      }catch(e) {

                      }
                  }

                  if(Request.requests) {
                      delete Request.requests[this.index];
                  }
                  this.xhr = null;
              }

              this.onLoad = function() {
                  var data;
                  try {
                      var contentType;
                      try {
                          contentType = this.xhr.getResponseHeader("Content-Type");
                      }catch(e) {}
                      if(contentType == "application/octet-stream") {
                          data = this.xhr.response;
                      }else{
                          if(!this.supportsBinary) {
                              data = this.xhr.responseText;
                          } else {
                              var Buffer = require("./buffer");
                              data = String.fromCharCode.apply(null, new Buffer(this.xhr.response));
                          }
                      }
                  } catch(e) {
                      this.onError(e);
                  }
                  if( null != data) {
                      this.onData(data);
                  }
              }

              this.hasXDR = function() {
                  return (!window || "undefined" !== typeof window.XDomainRequest) && !this.xs && this.enablesXDR;
              }

              this.abort = function() {
                  this.cleanup();
              }
              if(window.attachEvent) {
                window.attachEvent("onunload", Request.unloadHandler);
              }else{
								window.addEventListener("beforeunload", Request.unloadHandler, false);
							}

          }).call(Request.prototype);
      }else{
        var URL = require("url");
        var Request = function(opts) {
            this.uri = opts.uri;
            this.method = opts.method || "GET";
            this.data = opts.data;
            this.encoding = opts.encoding || "utf8";
            this.headers = lib.merger(defaultHeaders, opts.headers);
            this.create();
        };
        lib.inherits(Request, events);
        (function() {
            this.create = function() {
                var self = this;
                var opts = URL.parse(this.uri);
                opts.method = this.method;
                var handleName = opts.protocol.substring(0,  opts.protocol.length -1);
                var handle = require(handleName);
								var Domain = require("domain");
								var domain = Domain.create();
								domain.on("error", function(err) {
										self.onError(err);
								});
								domain.run(function() {
									var req = this.req = handle.request(opts, function(res) {
											if(res.statusCode != 200) {
													return self.onError(res.statusCode);
											}
											self.emit("headers", res.headers);
											res.setEncoding(self.encoding);
											var data = "";
											res.on("data", function(chunk) {
													self.emit("chunk", chunk);
													data += chunk.toString();
											});
											res.on("end", function() {
													self.onData(data, res.headers);
											});
									});
									req.on("error", function(error) {
											self.onError(error);
									});
									req.end(this.data);
									if(Request.requests) {
											this.index = Request.requests.requestsCount++;
											Request.requests[this.index]  = this;
									}
								});

            }
            this.onError = function(error) {
                this.emit("error", error);
                this.cleanup(true);
            }
            this.onData = function(data, type) {
                this.emit("data", data, type);
                this.cleanup(false);
            }
            this.cleanup = function(fromError) {
                if("undefined" == typeof this.req || null == this.req) {
                    return;
                }
                this.onData = this.onError = empty;
                if(fromError) {
                    try {
                        this.req.abort();
                    }catch(e){}
                }
                if(Request.requests) {
                    delete Request.requests[this.index];
                }
                this.req = null;
            }
        }).call(Request.prototype);

      }
      (function() {
          this.requests = {};
          this.requestsCount = 0;
          var _self = this;
          this.unloadHandler = function() {
              for(var i in _self.requests) {
                  if(_self.requests.hasOwnProperty(i)) {
                      _self.requests[i].abort();
                  }
              }
          }
              var escape = function(str) {
                  return encodeURIComponent(str);
              }
              var stringifyPrimitive = function(v) {
									console.log(v);
                  switch(typeof v) {
                      case "string":
                      return v;
                      case "boolean":
                      return v? "true": "false";
                      case "number":
                      return isFinite(v)? v: "";
                      case "object":
                      return JSON.stringify(v);
                      default:
                      return "";
                  }
              }
              var urlencode = this.urlencode = function(obj, sep, eq) {
								sep = sep || "&";
								eq = eq || "=";
								if(obj === null) {
									obj = undefined;
								}
								if(typeof obj === "object") {
									return Object.keys(obj).map(function(k) {
										var ks = escape(stringifyPrimitive(k)) + eq;
										if(Array.isArray(obj[k])) {
											return ks + escape(JSON.stringify(obj[k]));
										} else {
											return ks + escape(stringifyPrimitive(obj[k]));
										}
									}).join(sep);
								}
              }
              var urldecode = this.urldecode = function(qs) {
                  var qry = {};
                  var pairs = qs.split("&");
                  for(var i = 0, l = pairs.length; i < l; i++) {
                      var pair = pairs[i].split("=");
                      qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                  }
                  return qry;
              }

              this.get = function(uri, data, opts, onData, onError) {
                  if(lib.isFunction(opts)) {
                      onError = onData;
                      onData = opts;
                      opts = {};
                  }
                  opts.method = "GET";
                  opts.uri = uri + "?" + urlencode(data);
                  var req = new Request(opts);
                  onData && req.on("data", onData);
                  onError && req.on("error", onError);
                  return req;
              }
                  var getType = function(headers) {
                      if(!headers["Content-type"]) {
                          return "text";
                      }
                      if(headers["Content-type"].match(/octet-stream/i)) {
                          return "octet-stream";
                      }
											if(headers["Content-type"].match(/urlencoded/i)) {
													return "urlencoded";
											}
                      if(headers["Content-type"].match(/json/i)) {
                          return "json";
                      }
                      if(headers["Content-type"].match(/text/i)) {
                          return "text";
                      }
                  }
              var getData = function(data, headers) {
                  switch(getType(headers)) {
                      case "urlencoded":
                          return urlencode(data);
                      break;
                      case "json":
                          return JSON.stringify(data);
                      break;
                      case "octet-stream":
                          if(lib.isString(data)) {
                              return data;
                          }
                          var keys = Object.keys(data);
                          headers["x-file-name"] = keys[0];
                          return data[keys[0]];
                      break;
                      default:
                          return data.toString();
                      break;
                  }
              }
          this.post = function(uri, data, opts, onData, onError) {
              if(lib.isFunction(opts)) {
                  onError = onData;
                  onData = opts;
                  opts = {};
              }
              opts.method = "POST";
              opts.headers = opts.headers || {};
              opts.uri = uri;
              opts.data = getData(data, opts.headers);
              opts.headers["Content-length"] = opts.data.length;
              var req = new Request(opts);
              onData && req.on("data", onData);
              onError && req.on("error", onError);
              return req;
          }
          this.XMLHttpRequest = true;
      }).call(Request);

      module.exports = Request;
  });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_dom/dom", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
			var latte_lib = require("latte_lib");
			var DomOn = function(element, type, callback) {
				if(element.addEventListener) {
					element.addEventListener(type, callback);
				}else if (element.attachEvent) {
		            element.attachEvent("on" + type, handler);
		        } else {
		            element["on" + type] = handler;
		        }

				//console.log("dom no add Event")
			}
			var DomOff = function(element, type, callback) {

			}
			var Dom = function(id) {
				var element = document.getElementById(id);
				var self = this;
				DomOn(element, "change", function(value) {
					self.emit("change", element.value);
				});
				Object.defineProperty(this, "value", {
			        get: function () {
			        	return element.value;
			        },
			        set: function (value) { 
			        	element.value = value; 
			        }
			    });
				this.element = element;
			};
			latte_lib.inherits(Dom, latte_lib.events);
		(function() {

		}).call(Dom.prototype);
		module.exports = Dom;
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });

(function(define) { 'use strict';
	define("latte_dom/index", ["require", "exports", "module", "window"],
	function(require, exports, module, window) {
		(function() {
			var Dom = require("./dom");
			this.get = function(id) {
				//var elment = document.getElementById('id');
				return new Dom(id);
			}
		}).call(module.exports);
	});
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); });
