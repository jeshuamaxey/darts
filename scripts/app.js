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

/*
* This gets called
*/
app.main = function() {
	var sd;
	//if you want to do use sd = z then set it so:
	//var sdMin = x, sdMax = x+sdStep, sdStep = whatever;
	var sdXMin = 13.0, sdXMax = 21.0,
			sdYMin = 13.0, sdYMax = 21.0,
			sdStep = 2.0;

	var loopLimY = (sdYMax-sdYMin)/sdStep;

	for(var d=0; d<loopLimY; d++) {
		console.log("d = "+d);
		//set standard deviation
		sd = app.setStdDev(sdXMin + d*sdStep, sdYMin + d*sdStep);
		mean = app.setMean(0, 0);
		//crunch da numberz
		hm.generateHeatmap(mean, sd);
	}
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

/*
* Generates a random integer between 0 and randMax
*/
app.randomInt = function(randMax) {
	return Math.floor(Math.random()*randMax);
}

//run
app.main();