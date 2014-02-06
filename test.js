/*
* small script to demonstrate the speed efficiencies of
* memoization in the dartboard module
*/

var db = require('./modules/dartboard.js')
var config = require('./modules/config.js')
var a = 0;

console.time('first');

for(x=0;x<config.meshSize;x++) {
	for(y=0;y<config.meshSize;y++) {
		a = db.dartboard(x,y);
	}
}

console.timeEnd('first');
console.time('Second')

for(x=0;x<config.meshSize;x++) {
	for(y=0;y<config.meshSize;y++) {
		a = db.dartboard(x,y);
	}
}

console.timeEnd('Second')
console.time('Third')

for(x=0;x<config.meshSize;x++) {
	for(y=0;y<config.meshSize;y++) {
		a = db.dartboard(x,y);
	}
}

console.timeEnd('Third')