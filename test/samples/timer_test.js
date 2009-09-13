spec('Verify setTimeout', [
	'When I set a timer to 1500ms',
	'I expect it to fire within 100ms of that',
]);

define(/When I set a timer to (\d+)ms/, function(timeout) {
	this.expect(1);

	this.world.start = (+new Date());
	this.world.timeout = timeout;

	var self = this;
	setTimeout(function() {
		self.ok();
	}, timeout);
});

define(/I expect it to fire within (\d+)ms of that/, function(tolerance) {
	var duration = ((+new Date()) - this.world.start);
	this.assertWithin(this.world.timeout, duration, tolerance);
});