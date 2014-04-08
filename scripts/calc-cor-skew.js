/*
*  A script to retrospective calculate the
*	 correlation of throw data
*/

var fs = require('fs');
var files = require('../modules/files.js');
var stats = require('../modules/stats.js')

var dir = __dirname + '/../public/data/throw-data/'
var file = 'all-jack'

var app = {};

fs.readFile(dir+file+'.json', 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }

  //if no error, get to work
  app.data = JSON.parse(data);

  //create an array of just the mmX and mmY values
  //which the correlation function can work with
	var arr = [];
	for (var j = app.data.raw['throws'].length - 1; j >= 0; j--) {
		//make sure to exclude bounce outs from the array
		if(!app.data.raw['throws'][j].bounceOut) {
			arr.push({
				'mmX': parseFloat(app.data.raw['throws'][j].mmX),
				'mmY': parseFloat(app.data.raw['throws'][j].mmY)
			});
		}
	}
	//calculate the correlation
	var meanX = app.data.preprocessed.mmX.mean;
	var meanY = app.data.preprocessed.mmY.mean;
	var sdX = app.data.preprocessed.mmX.stdDev;
	var sdY = app.data.preprocessed.mmY.stdDev;

	var correlation = stats.correlation(arr, meanX, meanY, sdX, sdY);
	//jack: uncomment this when you're done
	//var skew = stats.skew(arr, meanX, meanY, sdX, sdY);
	//write to file
	app.data.preprocessed.correlation = ''+correlation;
	//app.data.preprocessed.skew = ''+skew;
	files.writeToFile(app.data, file+'.json', dir);
});