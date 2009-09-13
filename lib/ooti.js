(function(ooti) {
	var libTest = require('test.js');

	exports.load = function(path) {
		var test = new libTest.Test();
		test.load(path);
		return test;
	};

	exports.formatter = function(name) {
		// FIXME: ../lib is a hack, would need absolute module path loading for this to work
		var formatter = require('../lib/formatter/'+name+'.js');
		return new formatter.Formatter();
	};

	exports._parse = function(test) {

	};
})(exports);