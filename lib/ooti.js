(function(ooti) {
	var libGroup = require('group.js');

	exports.load = function(path) {
		var group = new libGroup.Group();
		group.load(path);
		return group;
	};

	exports.formatter = function(name, options) {
		// FIXME: ../lib is a hack, would need absolute module path loading for this to work
		var formatter = require('../lib/formatter/'+name+'.js');
		return new formatter.Formatter(options);
	};
})(exports);