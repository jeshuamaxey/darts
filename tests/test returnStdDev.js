/*
* small script to demonstrate the speed efficiencies of
* memoization in the dartboard module
*/

var stats = require('./../modules/stats.js')
var a = 0;

console.time('first');

for(x=0;x<201;x++) {
		a = stats.returnStdDev(x/2);
		console.log(a);
}

console.timeEnd('first');
console.time('Second')

for(x=0;x<201;x++) {
		a = stats.returnStdDev(x/2);
}

console.timeEnd('Second')
console.time('Third')

for(x=0;x<201;x++) {
		a = stats.returnStdDev(x/2);
}

console.timeEnd('Third')