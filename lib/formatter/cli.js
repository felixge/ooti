(function(cli) {
	var libUtil = require('../util.js');

	cli.Formatter = function(options) {
		this.options = {
			quite: false,
		};
		libUtil.extend(this.options, options || {});
	};

	cli.Formatter.prototype.observe = function(group) {
		var options = this.options;
		group.addListener('test.start', function(test) {
			if (!options.quite) {
				puts('==> '+test.path);
			}

			test.addListener('testCase.start', function(testCase) {
				testCase
					.addListener('step.before', function(step) {
						if (options.quite) {
							return;
						}
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
						if (options.quite) {
							return;
						}
						puts('');
					});
			});

			test.addListener('testCase.end', function(testCase, is) {
				if (options.quite) {
					return;
				}
				puts('');
			});
		});

		group.addListener('group.end', function(stats) {
			if (options.quite) {
				puts('');
			}

			puts(libUtil.sprintf(
				'%s fail, %s wip, %s pass',
				stats.fail,
				stats.wip,
				stats.pass
			));
		});
	};
})(exports);