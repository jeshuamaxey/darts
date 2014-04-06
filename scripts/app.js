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
	var sd, cor, mesh;
	//if you want to do use sd = z then set it so:
	//var sdMin = z, sdMax = z+sdStep, sdStep = whatever;
	var sdXMin = 35, sdXMax = 35.5,
			sdYMin = 34, sdYMax = 34.5,
			sdStep = 0.5;

	//if you want to do use cor = z then set it so:
	//var corMin = z, corMax = z+corStep, corStep = whatever;
	var corMin = -1, corMax = 1,
			corStep = 0.1;

	//(un)comment based on whether you're looping through cor or sd
	//var loopLim = (sdYMax-sdYMin)/sdStep;
	var loopLim = (corMax-corMin)/corStep;
	sd = app.setStdDev(100, 100);
	//cor = 0;

	for(var d=0; d<loopLim; d++) {
		//set standard deviation
		//(un)comment based on whether you're looping through cor or sd
		//sd = app.setStdDev(sdXMin + d*sdStep, sdYMin + d*sdStep);
		cor = corMin + d*corStep

		mean = app.setMean(9, -5);
		//set file names
		var fileName = files.generateFileName(sd, cor);
		var dirName = __dirname + '/../public/data/heatmaps';
		//intelligently choose directory based on mesh size
		if(config.meshSize == 400) dirName += '/res400';
		//only bother to generate data if the file doesn't already exist
		if(!fs.existsSync(dirName+'/'+fileName)) {
			console.log(dirName+'/'+fileName + " doesn't exist");
			//crunch da numberz
			mesh = hm.generateHeatmap(mean, sd, cor);
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