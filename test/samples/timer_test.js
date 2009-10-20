spec('Verify setTimeout', [
	'When I set a timer to 1500ms',
	'I expect it to fire within 100ms of that',
]);

define(/When I set a timer to (\d+)ms/, function(test, timeout) {
	test.expect(1);

	test.world.start = (+new Date());
	test.world.timeout = timeout;

	var self = this;
	setTimeout(function() {
		self.ok();
	}, timeout);
});

define(/I expect it to fire within (\d+)ms of that/, function(test, tolerance) {
	var duration = ((+new Date()) - test.world.start);
	test.assertWithin(test.world.timeout, duration, tolerance);
});