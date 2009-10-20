(function(test) {
	var libUtil = require('util.js');
	var libTestCase = require('test_case.js');

	test.Test = function() {
		this.async = false;
		this.path = null;
		this.source = null;

		this.testCases = [];
		this.stepDefinitions = [];

		this.stats = {pass: 0, fail: 0, wip: 0};
	};
	node.inherits(test.Test, node.EventEmitter)

	test.Test.prototype.load = function(path) {
		this.path = path;
		this.source = node.cat(path, 'utf8').wait();

		this.compile();
	};

	test.Test.prototype.compile = function() {
		var testEnv = function() {
			var __content = {testCases: [], stepDefinitions: []};

			var test = function(name, step) {
				__content.testCases.push({
					name: name,
					type: 'test',
					steps: [step],
				});
			};

			var spec = function() {
				if (typeof arguments[0] == 'string') {
					var steps = arguments[1], name = arguments[0];
				} else {
					var steps = arguments[0], name = steps[0];
				}

				__content.testCases.push({
					name: name,
					type: 'spec',
					steps: steps,
				});
			};

			var define = function(regex, fn) {
				__content.stepDefinitions.push({
					regex: regex,
					fn: fn,
				});
			};

			// >>>test_source_goes_here<<<

			;return __content;
		};

		testEnv = '('+testEnv.toString()+')';
		testEnv = testEnv.replace(/\n|\r/g, '');
		testEnv = testEnv.replace('// >>>test_source_goes_here<<<', this.source);

		testEnv = node.compile(testEnv, this.path)();
		this.testCases = testEnv.testCases;
		this.stepDefinitions = testEnv.stepDefinitions;
	};

	test.Test.prototype.run = function(options) {
		libUtil.extend(this, options);

		this.emit('test.start');

		var self = this;
		libUtil.each(this.testCases, function(i, testCase) {
			testCase = new libTestCase.TestCase({
				path: self.path,
				name: testCase.name,
				type: testCase.type,
				steps: testCase.steps,
				stepDefinitions: self.stepDefinitions,
			});

			// Disabled all promise stuff for now - something odd is going on here
			var promise = new node.Promise();
			
			testCase.addListener('testCase.start', function() {
				self.emit('testCase.start', testCase, {
					first: (i === 0),
					last: (i === self.testCases.length - 1),
				});
			});
			
			testCase.addListener('testCase.end', function() {
				libUtil.each(testCase.stats, function(key, val) {
					self.stats[key] = self.stats[key] + val;
				});

				var last = (i === self.testCases.length - 1);
				self.emit('testCase.end', testCase, {
					first: (i === 0),
					last: last,
				});
				if (!self.async) {
					promise.emitSuccess();
				}

				if (last) {
					self.emit('test.end', self.stats);
				}
			});

			libTestCase.run(testCase);

			if (!self.async) {
				promise.wait();
			}
		});
	};
})(exports);