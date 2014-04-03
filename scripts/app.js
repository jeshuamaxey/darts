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
	var sd, cov, mesh;
	//if you want to do use sd = z then set it so:
	//var sdMin = z, sdMax = z+sdStep, sdStep = whatever;
	var sdXMin = 35, sdXMax = 35.5,
			sdYMin = 34, sdYMax = 34.5,
			sdStep = 0.5;

	//if you want to do use cov = z then set it so:
	//var covMin = z, covMax = z+covStep, covStep = whatever;
	var covMin = -1, covMax = 1,
			covStep = 0.1;

	//(un)comment based on whether you're looping through cov or sd
	//var loopLim = (sdYMax-sdYMin)/sdStep;
	var loopLim = (covMax-covMin)/covStep;
	sd = app.setStdDev(100, 100);
	//cov = 0;

	for(var d=0; d<loopLim; d++) {
		//set standard deviation
		//(un)comment based on whether you're looping through cov or sd
		//sd = app.setStdDev(sdXMin + d*sdStep, sdYMin + d*sdStep);
		cov = covMin + d*covStep

		mean = app.setMean(9, -5);
		//set file names
		var fileName = files.generateFileName(sd, cov);
		var dirName = __dirname + '/../public/data/heatmaps';
		//intelligently choose directory based on mesh size
		if(config.meshSize == 400) dirName += '/res400';
		//only bother to generate data if the file doesn't already exist
		if(!fs.existsSync(dirName+'/'+fileName)) {
			console.log(dirName+'/'+fileName + " doesn't exist");
			//crunch da numberz
			mesh = hm.generateHeatmap(mean, sd, cov);
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