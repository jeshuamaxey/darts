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
	var sd, mesh;
	//if you want to do use sd = z then set it so:
	//var sdMin = x, sdMax = x+sdStep, sdStep = whatever;
	var sdXMin = 1.0, sdXMax = 100.5,
			sdYMin = 1.0, sdYMax = 100.5,
			sdStep = 0.5;

	var loopLimY = (sdYMax-sdYMin)/sdStep;

	for(var d=0; d<loopLimY; d++) {
		//set standard deviation
		sd = app.setStdDev(sdXMin + d*sdStep, sdYMin + d*sdStep);
		mean = app.setMean(0, 0);
		//set file names
		var fileName = files.generateFileName(sd);
		var dirName = __dirname + '/../public/data/symmetric';
		if(config.meshSize == 400) dirName += '/res400';
		//only bother to generate data if the file doesn't already exist
		if(!fs.existsSync(dirName+'/'+fileName)) {
			console.log(dirName+'/'+fileName + " doesn't exist");
			//crunch da numberz
			mesh = hm.generateHeatmap(mean, sd);
			//write data to file
			files.writeToFile(mesh, fileName, dirName);
		} else {
			console.log(dirName+'/'+fileName + " does exist. Skipping over it")
		}
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