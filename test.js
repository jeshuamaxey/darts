/*
* small script to demonstrate the speed efficiencies of
* memoization in the dartboard module
*/

var db = require('./modules/dartboard.js')
var a = 0;

console.time('first');

for(x=0;x<340;x++) {
	for(y=0;y<340;y++) {
		a = db.dartboard(x,y);
	}
}

console.timeEnd('first');
console.time('Second')

for(x=0;x<340;x++) {
	for(y=0;y<340;y++) {
		a = db.dartboard(x,y);
	}
}

console.timeEnd('Second')
console.time('Third')

for(x=0;x<340;x++) {
	for(y=0;y<340;y++) {
		a = db.dartboard(x,y);
	}
}

console.timeEnd('Third')