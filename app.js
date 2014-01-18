var app = app || {}; 

var fs = require('fs');

app.N = 130; //mesh dimnesions

app.mean = 0;
app.variance = 1;
app.stdDev = Math.sqrt(app.variance);

app.gaussian1D = function(x) {
  var m = app.stdDev * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - app.mean, 2) / (2 * app.variance));
  return e / m;
}

app.meanX = 0;
app.meanY = 0;
app.varianceX = 2;
app.varianceY = 2;
app.stdDevX = Math.sqrt(app.varianceX);
app.stdDevY = Math.sqrt(app.varianceY);

app.gaussian2D = function(x, y, xBar, yBar) {
	//check the normalisation constant
  var m = app.stdDevX * app.stdDevY * Math.sqrt(2 * Math.PI);
  var e = Math.exp( - ( Math.pow(x - xBar, 2) / (2 * app.varianceX) + Math.pow(y - yBar, 2) / (2 * app.varianceY) ) );
  return e / m;
}

app.make2DMesh = function(size) {
	var arr = new Array(size);
	for (var i = arr.length - 1; i >= 0; i--) {
		arr[i] = new Array(size);
	};
	return arr;
}

app.fillMesh = function() {
	var mean = app.mesh.length/2;
	for (var x = app.mesh.length - 1; x >= 0; x--) {
		for (var y = app.mesh.length - 1; y >= 0; y--) {
			//app.mesh[x][y] = (x*y)%255; //use to fake it
			app.mesh[x][y] = app.gaussian2D(x,y,mean,mean);
		};
	};
}

app.addToMesh = function(meanX, meanY) {
	//var mean = app.mesh.length/2;
	for (var x = app.mesh.length - 1; x >= 0; x--) {
		for (var y = app.mesh.length - 1; y >= 0; y--) {
			//app.mesh[x][y] = (x*y)%255; //use to fake it
			app.mesh[x][y] += app.gaussian2D(x,y,meanX,meanY);
		};
	};
}

app.writeToFile = function() {
	var outFile = './data/darts.json';

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

//SCRIPT BIT

app.mesh = app.make2DMesh(app.N);
app.fillMesh();
for(c=0;c<2000;c++) {
	var x = app.randomInt(app.N);
	var y = app.randomInt(app.N);
	app.addToMesh(x,y);
}
app.writeToFile();


//END SCRIPT BIT
module.exports = app;