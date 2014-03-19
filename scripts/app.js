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
	var sdMin = 0.5, sdMax = 1.0, sdStep = 0.5;
	var loopLim = (sdMax-sdMin)/sdStep;

	for(var c=0; c<loopLim; c++) {
		//configure mesh
		app.mesh = mesh.make2DMesh(config.meshSize);
		mesh.zeroMesh(app.mesh);
		//set standard deviation
		sd = {
			'x' : sdMin + c*sdStep,
			'y' : sdMin + c*sdStep
		};
		//crunch da numberz
		hm.generateHeatmap(sd, app.mesh, true);
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