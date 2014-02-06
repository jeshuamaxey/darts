var app = app || {}; 

/* 3RD PARTY MODULES */
var fs = require('fs');
var progressBar = require('progress');

/* OUR MODULES */
var config = require('./modules/config.js');
var stats = require('./modules/stats.js');
var db = require('./modules/dartboard.js');

// Read in the mesh size
app.N = config.meshSize;

app.make2DMesh = function(size) {
	var arr = new Array(size);
	for (var i = arr.length - 1; i >= 0; i--) {
		arr[i] = new Array(size);
	}
	return arr;
}

app.fillMesh = function() {
	var mean = app.mesh.length/2;
	for (x = 0; x < app.N; x++) {
		for (y = 0; y < app.N; y++) {
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
	  , total: app.N
	});
	//start big loop
	for (var x = 0; x < app.N; x++) {
		for (var y = 0; y < app.N; y++) {
			app.weight(x,y, sdX, sdY);
		}
		//update progress bar
		app.bar.tick();
	}
	//destroy progress bar
	app.bar = null;
}

app.weight = function(pixelX, pixelY, sdX, sdY) {
	for (var x = 0; x < app.N; x++) {
		for (var y = 0; y < app.N; y++) {
			app.mesh[pixelX][pixelY] += db.dartboard(x, y)* stats.gaussian2D(x, y, pixelX, pixelY, sdX, sdY);
		}
	}	
}

app.zeroMesh = function() {
	for (x = 0; x < app.N; x++) {
		for (y = 0; y < app.N; y++) {
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
		var x = app.randomInt(app.N);
		var y = app.randomInt(app.N);
		app.addToMesh(x,y);
	}
}

//SCRIPT BIT

app.mesh = app.make2DMesh(app.N);

app.zeroMesh();

// var sdX = 0.5;
// var sdY = 0.5;

// app.generateHeatmap(sdX, sdY);

// var fileName = 'sdX-'+sdX-+'sdY'+sdY'+.json';
// app.writeToFile(fileName);

/*
* generating maps for the range 0.5 < sd < 20 in steps of 0.5
*/
var sdMax = 4, sdMin = 0.5, sdStep = 0.5, sd = 0;

var loopLimit = ( (sdMax - sdMin) / sdStep);

for(var c=0; c < loopLimit; c++) {
	//reset mesh
	app.zeroMesh();
	//update model variables
	sd = sdMin + c*sdStep;
	//crunch da numberz
	app.generateHeatmap(sd, sd);
	//output data
	var fileName = 'sd-'+sd+'.json';
	app.writeToFile(fileName, 'public/data/symmetric/');
}
/*
* end big fat loop
*/

//END SCRIPT BIT
module.exports = app;