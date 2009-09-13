spec([
	'When I multiply 1 * 1',
	'I expect the result to be 1'
]);

spec([
	'When I multiply 2 * 2',
	'I expect the result to be 4'
]);

spec([
	'When I multiply 3 * 3',
	'I expect the result to be 9'
]);

define(/When I multiply (\d+) \* (\d+)/, function(a, b) {
	this.world.a = a;
	this.world.b = b;
});

define(/I expect the result to be (\d+)/, function(c) {
	this.assertEquals(c, this.world.a * this.world.b);
});