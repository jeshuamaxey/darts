var app = app || {}; 

/* 3RD PARTY MODULES */
var fs = require('fs');

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
	for (var x = 0; x < app.N; x++) {
		console.log("calculating weight for "+x+"th row");
		for (var y = 0; y < app.N; y++) {
			app.weight(x,y, sdX, sdY);
		}
	}
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

app.writeToFile = function(fileName) {
	outFile = 'public/data/' + (fileName || 'output.json');

	fs.writeFile(outFile, JSON.stringify(app.mesh, null, 2), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved to " + outFile);
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

var acc = 0.31;
var sdX = config.meshSize*config.meshRatio.bullseye/0.4;
var sdY = config.meshSize*config.meshRatio.bullseye/0.4;

app.generateHeatmap(sdX, sdY);

var fileName = 'acc-'+acc+'.json';
app.writeToFile(fileName);

var acc, sdX, sdY, fileName;

// for(var c=0; c<1000; c++) {
// 	//reset mesh
// 	app.zeroMesh();
// 	//update model variables
// 	acc = (c*0.01).toFixed(2);
// 	sdX = stats.erf(acc);
// 	sdY = stats.erf(acc);
// 	//crunch da numberz
// 	app.generateHeatmap(sdX, sdY);
// 	//output data
// 	fileName = 'acc-'+acc+'.json';
// 	app.writeToFile(fileName);
// }

//END SCRIPT BIT
module.exports = app;