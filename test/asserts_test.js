spec([
	'assertTrue(true) should pass',
	'assertTrue(false) should fail',
]);

spec([
	'assertFalse(false) should pass',
	'assertFalse(true) should fail',
]);

spec([
	'assertWithin(20, 17, 3) should pass',
	'assertWithin(20, 23, 3) should pass',
	'assertWithin(20, 24, 3) should fail',
]);


define(/^(\w+)\(([^)]+)\) should pass/, function(fn, val) {
	this.assertTrue(fn in this);

	var val = JSON.parse('['+val+']');
	this[fn].apply(this, val);
});

define(/^(\w+)\(([^)]+)\) should fail/, function(fn, val) {
	var val = JSON.parse('['+val+']'), self = this;
	this.assertThrows(function() {
		self[fn].apply(self, val);
	});
});