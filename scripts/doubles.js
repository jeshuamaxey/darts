var doubles = require('../modules/doubles.js');

var data = [];
var arr = [];
var dartboardnumbers = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];

var sdMin = 10.0, sdMax = 20.0, sdStep = 10.0;
var loopLim = (sdMax - sdMin)/sdStep;
var sd, prob;

var csv = 'number,';

for(var c=0; c<loopLim; c++) {
	//empty temp array
	arr = [];
	//set sd
	sd = {
		'x': sdMin + c*sdStep,
		'y': sdMin + c*sdStep
	};
	//prep csv
	csv += ''+ sd.x;
	if(c!==loopLim-1) csv += ',';

	//fill temp array with double probs for this sd
	for (var i=0; i<dartboardnumbers.length; i++) {
		prob = doubles.chance(dartboardnumbers[i], sd)
		arr.push(prob);
	}
	//add this array to big data table
	data.push(arr);
}

console.log(data)

// csv += '\n';

// for (var i = 0; i < dartboardnumbers.length; i++) {
// 	csv += dartboardnumbers[i];
// 	csv += ',';
// 	for (var j = 0; j < loopLim; j++) {
// 		csv += data[j][i];
// 		if(j!==data[j].length-1) csv += ',';
// 	};
// 	csv += '\n';
// };

// files.writeToFile(csv, 'doubles.csv');