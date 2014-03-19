var stats = require('../modules/stats.js');

var sum = 0,
		l = -50,
		r = 50,
		N = 100;

var h = (r - l)/N

for (var x = l; x < r; x+=h) {
	for (var y = l; y < r; y+=h) {
		sum += stats.gaussian2D(x,y);
	}
}

console.log("N: " + N);
console.log("h: " + h);
console.log("sum*h*h: " + sum*h*h);