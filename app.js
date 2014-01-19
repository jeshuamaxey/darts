var app = app || {}; 

/* 3RD PARTY MODULES */
var fs = require('fs');

/* OUR MODULES */
var stats = require('./modules/stats.js');
var db = require('./modules/dartboard.js');

app.N = 340; //mesh dimnesions

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
			//app.mesh[x][y] = stats.gaussian2D(x,y,mean,mean);
		};
	};
}

app.zeroMesh = function() {
	var mean = app.mesh.length/2;
	for (x = 0; x < app.N; x++) {
		for (y = 0; y < app.N; y++) {
			app.mesh[x][y] = 0;
		};
	};
}

app.addToMesh = function(meanX, meanY) {
	//var mean = app.mesh.length/2;
	for (var x = app.mesh.length - 1; x >= 0; x--) {
		for (var y = app.mesh.length - 1; y >= 0; y--) {
			app.mesh[x][y] += stats.gaussian2D(x,y,meanX,meanY,400,400);//*db.dartboard(x,y);
		}
	}
}

app.writeToFile = function() {
	var outFile = 'public/data/darts.json';

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
app.fillMesh();

//uncomment to fill darts.json with fake data
//app.fakeData(400);

app.writeToFile();

//END SCRIPT BIT
module.exports = app;