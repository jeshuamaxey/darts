var app = app || {}; 

/* 3RD PARTY MODULES */
var fs = require('fs');
var progressBar = require('progress');

/* OUR MODULES */
var config = require('./modules/config.js');
var stats = require('./modules/stats.js');
var db = require('./modules/dartboard.js');

// Read in the mesh size
//config.meshSize = config.meshSize;

app.mmToPix = config.meshSize/400;
app.pixTomm = 400/config.meshSize;

app.make2DMesh = function(size) {
	var arr = new Array(size);
	for (var i = arr.length - 1; i >= 0; i--) {
		arr[i] = new Array(size);
	}
	return arr;
}

app.fillMesh = function() {
	for (x = 0; x < config.meshSize; x++) {
		for (y = 0; y < config.meshSize; y++) {
			app.mesh[x][y] = db.dartboard(x,y);
		}
	}
}

app.generateHeatmap = function(sdX, sdY) {
	//creates nice progress bar in terminal
	app.bar = new progressBar('sdX: '+sdX.toFixed(1)+', sdY: '+sdY.toFixed(1)+' [:bar] :percent :etas', {
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

app.weight = function(pixelX, pixelY, sdX, sdY) {
	for (var x = 0; x < config.meshSize; x++) {
		for (var y = 0; y < config.meshSize; y++) {
			app.mesh[pixelX][pixelY] += db.dartboard(x, y)* stats.gaussian2D(x, y, pixelX, pixelY, sdX, sdY);
		}
	}	
}

app.zeroMesh = function() {
	for (x = 0; x < config.meshSize; x++) {
		for (y = 0; y < config.meshSize; y++) {
			app.mesh[x][y] = 0;
		};
	};
}

app.addToMesh = function(meanX, meanY) {
	for (var x = app.mesh.length - 1; x >= 0; x--) {
		for (var y = app.mesh.length - 1; y >= 0; y--) {
			app.mesh[x][y] += stats.gaussian2D(x,y,meanX,meanY,400,400);//*db.dartboard(x,y);
		}
	}
}

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

app.fakeData = function(n) {
	for(c=0;c<n;c++) {
		var x = app.randomInt(config.meshSize);
		var y = app.randomInt(config.meshSize);
		app.addToMesh(x,y);
	}
}

//SCRIPT BIT

app.mesh = app.make2DMesh(config.meshSize);

app.zeroMesh();

//update model variables

sd = 250.0*app.mmToPix;
//crunch da numberz
app.generateHeatmap(sd, sd);
//output data
var fileName = 'sd-';
if(sd<10) fileName += '0';
if(sd<100) fileName += '0';
fileName += sd.toFixed(1);
fileName += '.json';
app.writeToFile(fileName, 'public/data/symmetric/');

/*
* end big fat loop
*/


//END SCRIPT BIT
module.exports = app;