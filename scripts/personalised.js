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
	var sd = app.setStdDev(10, 10);
	var cor = -0;
	var mean = app.setMean(0, 0);
	//set file names
	var fileName = 'res400sdtenmm.json';
	var dirName = __dirname + '/../public/data/heatmaps/JackReport';
	//make personalised heatmaps higher res
	config.meshSize = 400;
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