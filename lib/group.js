(function(group) {
	var libUtil = require('util.js');
	var libTest = require('test.js');

	group.Group = function() {
		this.tests = [];
		this.async = false;

		this.stats = {pass: 0, fail: 0, wip: 0};
	};
	node.inherits(group.Group, node.EventEmitter)

	group.Group.prototype.load = function(path) {
		var stat = node.fs.stat(path).wait();
		if (stat.isFile()) {
			var files = [path];
		} else {
			var files = libUtil.findInPath(path, /_test\.js$/).wait();
		}

		var self = this;
		libUtil.each(files, function(i, file) {
			var test = new libTest.Test()
			test.load(file);

			self.tests.push(test);
		});
	};

	group.Group.prototype.run = function(options) {
		libUtil.extend(this, options);

		var i = -1, self = this;
		var next = function() {
			i++;
			if (i == (self.tests.length)) {
				return self.emit('group.end');
			}
			var test = self.tests[i];
			test
				.addListener('test.start', function() {
					self.emit('test.start', test, {
						first: (i === 0),
						last: (i === self.tests.length - 1),
					});
				})
				.addListener('test.end', function() {
					libUtil.each(test.stats, function(key, val) {
						self.stats[key] = self.stats[key] + val;
					});

					var last = (i === self.tests.length - 1);
					self.emit('test.end', test, {
						first: (i === 0),
						last: last,
					});

					if (!self.async && !last) {
						next();
					}

					if (last) {
						self.emit('group.end', self.stats);
					}
				});

			test.run();
			if (self.async) {
				next();
			}
		};

		setTimeout(function() {
			self.emit('group.start');
			next();
		});
	};
})(exports);