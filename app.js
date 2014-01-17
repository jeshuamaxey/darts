var app = app || {}; 

var fs = require('fs');

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
app.varianceX = 1;
app.varianceY = 1;
app.stdDevX = Math.sqrt(app.varianceX);
app.stdDevY = Math.sqrt(app.varianceY);

app.gaussian2D = function(x, y) {
	//check the normalisation constant
  var m = app.stdDevX * app.stdDevY * Math.sqrt(2 * Math.PI);
  var e = Math.exp( - ( Math.pow(x - app.meanX, 2) / (2 * app.varianceX) + Math.pow(y - app.meanY, 2) / (2 * app.varianceY) ) );
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
	for (var x = app.mesh.length - 1; x >= 0; x--) {
		for (var y = app.mesh.length - 1; y >= 0; y--) {
			app.mesh[x][y] = app.gaussian2D(x,y);
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

//SCRIPT BIT

app.mesh = app.make2DMesh(87);
app.fillMesh();
app.writeToFile();


//END SCRIPT BIT
module.exports = app;