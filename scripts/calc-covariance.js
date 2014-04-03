/*
*  A script to retrospective calculate the
*	 covariance of throw data
*/

var fs = require('fs');
var files = require('../modules/files.js');
var stats = require('../modules/stats.js')

var dir = '../public/data/throw-data/'
var file = '008'

var app = {};

fs.readFile(dir+file+'.json', 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }

  //if no error, get to work
  app.data = JSON.parse(data);

  //create an array of just the mmX and mmY values
  //which the covariance function can work with
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
	//calculate the covariance
	var meanX = app.data.preprocessed.mmX.mean;
	var meanY = app.data.preprocessed.mmY.mean;
	var sdX = app.data.preprocessed.mmX.stdDev;
	var sdY = app.data.preprocessed.mmY.stdDev;
	console.log(meanX,meanY,sdX,sdY)
	var covariance = stats.covariance(arr, meanX, meanY, sdX, sdY);
	//console.log(covariance);
	//write to file
	app.data.preprocessed.covariance = ''+covariance;
	files.writeToFile(app.data, file+'new.json', dir);
});