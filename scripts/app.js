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

/* Fix Variables */
config.mm2px = config.meshSize/400;
config.px2mm = 1/config.mm2px;

/*
* This get called
*/
app.main = function() {
	var sd;
	//if you want to do ust sd = z then set it so:
	//var sdMin = x, sdMax = x+sdStep, sdStep = whatever;
	var sdMin = 25, sdMax = 25.5, sdStep = 0.5;
	var loopLim = (sdMax-sdMin)/sdStep;

	for(var c=0; c<loopLim; c++) {
		//set standard deviation
		sd = app.setStdDev(sdMin + c*sdStep, sdMin + c*sdStep);
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