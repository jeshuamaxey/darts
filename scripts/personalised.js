/*
* A script to generate a single, personalised heatmap
*/

var app = app || {}; 

/*
* 3rd Party Modules
*/
var fs = require('fs');

/*
* Custom Modules
*/
var config = require('../modules/config.js');
var hm = require('../modules/heatmap.js');
var mesh = require('../modules/mesh.js');
var files = require('../modules/files.js');

/*
* This gets called
*/
app.main = function() {
	//set standard deviation
	var sd = app.setStdDev(35.0,34.5);
	var cor = -0.544;
	var mean = app.setMean(9.47, -4.61);
	//set file names
	var fileName = 'charlie.json';
	var dirName = __dirname + '/../public/data/heatmaps/personalised';
	//make personalised heatmaps higher res
	config.meshSize = 200;
	//crunch da numberz
	mesh = hm.generateHeatmap(mean, sd, cor);
	//write data to file
	files.writeToFile(mesh, fileName, dirName);
}

/*
* Creates a standard deviation in mm and px
*/
app.setStdDev = function(x, y) {
	return {
		'x' : x,
		'y' : y
	}
}

app.setMean = function(x, y) {
	return {
		'x' : x,
		'y' : y
	}
}

//run
app.main();