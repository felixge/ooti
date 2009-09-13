(function(testCase) {
	var libUtil = require('util.js');

	testCase.run = function(testCaseClass) {
		testCaseClass.emit('testCase.start');

		testCaseClass.addListener('step.complete', function(timeout) {
			if (this.timeoutTimer) {
				clearTimeout(this.timeoutTimer);
			}

			if (timeout) {
				try {
					this.fail('test to finish within '+this.timeoutMs+'ms', 'timeout');
				} catch (e) {
					testCaseClass.stats.fail++;
					testCaseClass.emit('step.fail', this.step, e);
					testCaseClass.emit('testCase.end');
				}
				this.emit('step.after', this.step);
			} else {
				this.emit('step.pass', this.step);
				this.emit('step.after', this.step);
				next();
			}
		});

		var i = -1;
		var next = function() {
			i++;
			if (i == (testCaseClass.steps.length)) {
				testCaseClass.emit('testCase.end');
				return;
			}
			var step = testCaseClass.steps[i];

			if (typeof step == 'string') {
				step = {
					name: step,
					definition: testCase._findDefinition(step, testCaseClass),
				};
			} else if (typeof step == 'function') {
				step = {
					name: testCaseClass.name,
					definition: {
						fn: step,
						args: [],
					},
				};
			}

			testCaseClass.step = step;
			testCaseClass.emit('step.before', step);

			var pass = false;
			if (!step.definition) {
				testCaseClass.stats.wip++;
				testCaseClass.emit('step.wip', step);
			} else {
				try {
					step.definition.fn.apply(testCaseClass, step.definition.args);

					if (!testCaseClass.remainingAsserts) {
						pass = true;
						testCaseClass.stats.pass++;
						testCaseClass.emit('step.pass', step);
					}
				} catch (e) {
					testCaseClass.stats.fail++;
					testCaseClass.emit('step.fail', step, e);
				}
			}

			if (!testCaseClass.remainingAsserts) {
				testCaseClass.emit('step.after', step);
				if (pass) {
					next();
				}
			}
		};

		next();
	};

	testCase._findDefinition = function(step, testCase) {
		var r;
		libUtil.each(testCase.stepDefinitions, function(i, definition) {
			var m = step.match(definition.regex);
			if (m) {
				m.shift();
				r = {
					regex: definition.regex,
					fn: definition.fn,
					args: m,
				};
				return false;
			}
		});

		return r;
	};

	// This is a bit of a hack, does anybody know how to get a proper stack trace object?
	testCase._parseStack = function(stack) {
		stack = stack.split(/\r?\n/);
		stack.shift();

		var r = [];
		libUtil.each(stack, function(i, str) {
			var m = str.match(/at (.+) \((.+):(\d+):(\d+)\)$/);
			if (m) {
				r.push({
					symbol: m[1],
					path: m[2],
					line: m[3],
					col: m[4],
				});
			}
		});
		return r;
	};

	testCase.TestCaseException = function(message, testCaseClass) {
		this.message = message;
		Error.captureStackTrace(this, testCase.TestCase.prototype.fail);

		this.trace = null;

		var self = this; stack = testCase._parseStack(this.stack);
		libUtil.each(stack, function(i, point) {
			if (point.path == testCaseClass.path) {
				self.trace = point;
			}
		});
	};

	testCase.TestCaseException.prototype.toString = function () {
	  return this.message;
	};

	// From Google v8's mjsunit.js test suite
	function deepEquals (a, b) {
		if (a == b) {
			return true;
		}
		if ((typeof a) !== 'object' || (typeof b) !== 'object' ||
			(a === null) || (b === null)) {
			return false;
		}
		if (a.constructor === Array) {
			if (b.constructor !== Array) {
				return false;
			}
			if (a.length != b.length) {
				return false;
			}
			for (var i = 0; i < a.length; i++) {
				if (i in a) {
					if (!(i in b) || !(deepEquals(a[i], b[i]))) {
						return false;
					}
				} else if (i in b) {
					return false;
				}
			}
			return true;
		}
		return false;
	};

	testCase.TestCase = function(settings) {
		this.world = {};

		this.path = null;
		this.name = null;
		this.type = null;
		this.steps = [];
		this.stepDefinitions = [];
		this.stats = {pass: 0, fail: 0, wip: 0};

		this.step = null;

		this.remainingAsserts = 0;
		this.timeoutTimer = null;
		this.timeoutMs = 0;

		libUtil.extend(this, settings || {});

		this.addListener('step.assert', function() {
			var self = this;
			setTimeout(function() {
				if (self.remainingAsserts && !self.stats.fail) {
					self.remainingAsserts--;
					if (self.remainingAsserts === 0) {
						self.emit('step.complete', false);
					}
				}
			});
		});
	};
	node.inherits(testCase.TestCase, node.EventEmitter);

	testCase.TestCase.prototype.expect = function(remainingAsserts) {
		this.remainingAsserts = remainingAsserts;
		this.timeout();
	};

	testCase.TestCase.prototype.timeout = function(ms) {
		if (this.timeoutTimer) {
			clearTimeout(this.timeoutTimer);
		}

		this.timeoutMs = ms || 5000;

		var self = this;
		this.timeoutTimer = setTimeout(function() {
			self.emit('step.complete', true);
		}, this.timeoutMs);
	};

	testCase.TestCase.prototype.fail = function(expected, found) {
		var message = 'Fail: Expected <'+expected+'> got <'+found+'>';
		throw new testCase.TestCaseException(message, this);
	};

	testCase.TestCase.prototype.assertThrows = function(fn) {
		this.emit('step.assert', 'throws');

		var hadException = false, r;
		try {
			r = fn();
		} catch (e) {
			hadException = true;
		}

		if (!hadException) {
			this.fail('exception', 'no exception');
		}
	};

	testCase.TestCase.prototype.ok = function(expected, found) {
		this.emit('step.assert', 'ok');
	};

	testCase.TestCase.prototype.assertEquals = function(expected, found) {
		this.emit('step.assert', 'equals');
		if (!deepEquals(expected, found)) {
			this.fail(expected, found);
		}
	};

	testCase.TestCase.prototype.assertTrue = function(found) {
		this.emit('step.assert', 'true');
		if (found !== true) {
			this.fail(true, found);
		}
	};

	testCase.TestCase.prototype.assertFalse = function(found) {
		this.emit('step.assert', 'false');
		if (found !== false) {
			this.fail(false, found);
		}
	};

	testCase.TestCase.prototype.assertWithin = function(found, expected, tolerance) {
		this.emit('step.assert', 'false');

		var diff = (found - expected);

		if (Math.abs(diff) > tolerance) {
			this.fail('within '+tolerance, 'diff of '+diff);
		}
	};
})(exports);