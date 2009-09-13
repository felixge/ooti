(function(cli) {
	var libUtil = require('../util.js');

	cli.Formatter = function() {
		
	};

	cli.Formatter.prototype.observe = function(test) {
		test.addListener('test.start', function() {
			puts('==> '+this.path);
		});

		test.addListener('testCase.start', function(testCase) {
			testCase
				.addListener('step.before', function(step) {
					print(step.name+' ');
				})
				.addListener('step.assert', function(step) {
					print('.');
				})
				.addListener('step.wip', function(step) {
					puts('');
					var errStr = 'Wip: Step has no matching step definition';
					puts(libUtil.prefixLines(errStr, '  '));
				})
				.addListener('step.fail', function(step, e) {
					puts('');
					var errStr = e.stack.toString();
					if (e.trace) {
						errStr = errStr.replace(/\n/, libUtil.sprintf(
							" on line %s col %s in %s\n",
							e.trace.line,
							e.trace.col,
							e.trace.path
						));
					}
					puts(libUtil.prefixLines(errStr, '  '));
				})
				.addListener('step.after', function(step) {
					puts('');
				});
		});

		test.addListener('testCase.end', function(testCase, is) {
			puts('');
		});

		test.addListener('test.end', function(stats) {
			puts(libUtil.sprintf(
				'%s fail, %s wip, %s pass',
				stats.fail,
				stats.wip,
				stats.pass
			));
		});
	};
})(exports);