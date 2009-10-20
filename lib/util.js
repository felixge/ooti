(function(util) {
	util.isArray = function(set) {
		return (set instanceof Array.prototype.constructor);
	};

	util.merge = function() {
		var args = Array.prototype.slice.call(arguments);
		var base = (args[0] instanceof Array.prototype.constructor)
			? []
			: {};
		args.unshift(base);
		return this.extend.apply(null, args);
	};

	util.extend = function() {
		for (var i = 1; i < arguments.length; i++) {
			if (arguments[i] instanceof Array.prototype.constructor) {
				for (var x = 0; x < arguments[i].length; x++) {
					arguments[0].push(arguments[i][x]);
				}
			} else {
				for (var key in arguments[i]) {
					arguments[0][key] = arguments[i][key];
				}
			}
		}
		return arguments[0];
	};

	util.each = function(set, fn) {
		if (set instanceof Array.prototype.constructor) {
			for (var i = 0; i < set.length; i++) {
				var r = fn.call(set[i], i, set[i]);
				if (r === false) {
					break;
				}
			}
			return;
		}

		for (var key in set) {
			var r = fn.call(set[key], key, set[key]);
			if (r === false) {
				break;
			}
		}
	};

	util.sprintf = function() {
		var args = Array.prototype.slice.call(arguments);
		var str = args.shift();
	
		return str.replace(/%s/g, function(m, i, s) {
			return args.shift();
		});
	};

	util.prefixLines = function(str, prefix) {
		str = str.split(/\r?\n/);
		for (var i = 0; i < str.length; i++) {
			str[i] = prefix + str[i];
		}
		return str.join("\n");
	};

	exports.findInPath = function(path, regex) {
		var matches = [];
		var promise = new node.Promise();
		var files = node.fs.readdir(path).wait();
		var left = 0;

		exports.each(files, function(i, file) {
			file = node.path.join(path, file);
			var stat = node.fs.stat(file).wait();

			if (!stat.isDirectory() && file.match(regex)) {
				matches.push(file);
			} else if (stat.isDirectory()) {;
				left++;
				exports.findInPath(file, regex).addCallback(function(r) {
					exports.each(r, function(i, file) {
						matches.push(file);
					});
					left--;
					if (!left) {
						promise.emitSuccess(matches);
					}
				});
			}
		});

		if (!left) {
			setTimeout(function() {
				promise.emitSuccess(matches);
			});
		}
		return promise;
	};
})(exports);