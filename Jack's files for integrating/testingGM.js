var hm = require('../modules/heatmap.js');
var fs = require('fs');

var sd = 1;

for (i =0; i < 3; i++) {
	hm.generateHeatmap({x: 0, y: 0}, {x: 16+i/2, y: 16+i/2});
	console.log(i);
}