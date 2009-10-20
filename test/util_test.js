var util = require('../lib/util.js');

test('sprintf', function() {
	this.assertEquals('foo loves bar', util.sprintf('foo %s bar', 'loves'));
});