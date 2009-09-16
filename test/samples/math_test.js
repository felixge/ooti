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

spec([
	'When I do 1 + 177',
	'I expect the result to be 178'
]);

define(/When I (?:\w+) (\d+) (\*|\+) (\d+)/, function(a, op, b) {
	this.result = eval(a+op+b);
});

define(/I expect the result to be (\d+)/, function(c) {
	this.assertEquals(c, this.result);
});