/*
*	 A script to retrospective calculate statistics on throw data
*  After discovering we'd divided by N and not N-1 when calculating
*  standard deviations, this became neccessary
*/

var fs = require('fs');
var files = require('../modules/files.js');
var stats = require('../modules/stats.js')

var dir = __dirname + '/../public/data/throw-data/'
var fileName = 'all-jack.json'
var newFileName = 'all-jack.json'

var app = {};

fs.readFile(dir+fileName, 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }

  //if no error, get to work
  app.data = JSON.parse(data);
  app.dataClicks = app.data.raw['throws'];

	var processedData = {};
	var val = ['mmR','mmX','mmY','pxR','pxX','pxY'];
	var arr = [];

	//reevaluate values
	for (var i = val.length - 1; i >= 0; i--) {
		arr = [];
		processedData[val[i]] = {};
		//create an array of just the values we're interested in
		for (var j = app.dataClicks.length - 1; j >= 0; j--) {
			//make sure to exclude bounce outs from the array
			if(!app.dataClicks[j].bounceOut) {
				arr.push(parseFloat(app.dataClicks[j][val[i]]));
			}
		};
		processedData[val[i]].mean = stats.mean(arr);
		processedData[val[i]].stdDev = stats.stdDev(arr);
	};
	//output
	app.data.preprocessed = processedData;
	files.writeToFile(app.data, newFileName, dir);
});