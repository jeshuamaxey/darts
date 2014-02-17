var app = app || {}; 

/* 3RD PARTY MODULES */
var fs = require('fs');
var progressBar = require('progress');

/* OUR MODULES */
var config = require('../modules/config.js');
var stats = require('../modules/stats.js');
var db = require('../modules/dartboard.js');

// Read in the mesh size
//config.meshSize = config.meshSize;

config.mm2px = config.meshSize/400;
config.px2mm = 1/config.mm2px;

//creates a standard deviation in mm and px
app.setStdDev = function(sd) {
	return {
		'mm' : sd,
		'px' : sd*config.mm2px
	}
}

//creates a square 2D mesh with dimensions size x size
app.make2DMesh = function(size) {
	var arr = new Array(size);
	for (var i = arr.length - 1; i >= 0; i--) {
		arr[i] = new Array(size);
	}
	return arr;
}

//creates the heatmap
app.generateHeatmap = function(sdX, sdY) {
	//creates nice progress bar in terminal
	app.bar = new progressBar('sdX: '+sdX.mm.toFixed(1)+'mm, sdY: '+sdY.mm.toFixed(1)+'mm [:bar] :percent :etas', {
	    complete: '='
	  , incomplete: ' '
	  , width: 80
	  , total: config.meshSize
	});
	//start big loop
	for (var x = 0; x < config.meshSize; x++) {
		for (var y = 0; y < config.meshSize; y++) {
			app.weight(x,y, sdX, sdY);
		}
		//update progress bar
		app.bar.tick();
	}
	//destroy progress bar
	app.bar = null;
}

//calculates the value of each pixel of the heatmap
app.weight = function(pixelX, pixelY, sdX, sdY) {
	for (var x = 0; x < config.meshSize; x++) {
		for (var y = 0; y < config.meshSize; y++) {
			app.mesh[pixelX][pixelY] += db.dartboard(x, y) * stats.gaussian2D(x, y, pixelX, pixelY, sdX.px, sdY.px);
		}
	}	
}

//sets all elements in the mesh to zero
app.zeroMesh = function() {
	for (x = 0; x < config.meshSize; x++) {
		for (y = 0; y < config.meshSize; y++) {
			app.mesh[x][y] = 0;
		};
	};
}

//save the heatmap mesh to file
app.writeToFile = function(fileName, dir) {
	outFile = (dir || 'public/data/') + (fileName || 'output.json');

	fs.writeFile(outFile, JSON.stringify(app.mesh, null, 2), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      //console.log("JSON saved to " + outFile);
	    }
	});

}

app.randomInt = function(randMax) {
	return Math.floor(Math.random()*randMax);
}

//SCRIPT BIT

var sdMin = 50.0, sdMax = 50.5, sdStep = 0.5;

var loopLim = (sdMax-sdMin)/sdStep;

for(var c=0; c<loopLim; c++) {
	//configure mesh
	app.mesh = app.make2DMesh(config.meshSize);
	app.zeroMesh();

	//set standard deviation
	sd = app.setStdDev(sdMin + c*sdStep);

	//crunch da numberz
	app.generateHeatmap(sd, sd);
	//output data
	var fileName = 'sd-';
	if(sd.mm<10) fileName += '0';
	if(sd.mm<100) fileName += '0';
	fileName += sd.mm.toFixed(1);
	fileName += '.json';
	app.writeToFile(fileName, 'public/data/symmetric/');
}

/*
* end big fat loop
*/


//END SCRIPT BIT
module.exports = app;