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


define(/^(\w+)\(([^)]+)\) should pass/, function(test, fn, val) {
	test.assertTrue(fn in this);

	var val = JSON.parse('['+val+']');
	test[fn].apply(this, val);
});

define(/^(\w+)\(([^)]+)\) should fail/, function(test, fn, val) {
	var val = JSON.parse('['+val+']'), self = this;
	test.assertThrows(function() {
		self[fn].apply(self, val);
	});
});