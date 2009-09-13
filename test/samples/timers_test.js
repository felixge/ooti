spec('Verify setTimeout', [
	'When I set a timer to 1500ms',
	'I expect it to fire within 200ms of that',
]);

define(/When I set a timer to (\d+)ms/, function(timeout) {
	expect(1);

	world.start = (+new Date());
	world.timeout = timeout;

	setTimeout(function() {
		ok();
	});
});

define(/I expect it to fire within (\d+)ms of that/, function(tolerance) {
	var duration = ((+new Date()) - world.start);
	assertWithin(tolerance, duration, expected);
});