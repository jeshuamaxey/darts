var hm = hm || {};

var priv = priv || {};

var progressBar = require('progress');
var db = require('../modules/dartboard.js');
var stats = require('../modules/stats.js');
var files = require('../modules/files.js');
var config = require('./config.js');
var mesh = require('./mesh.js');

// Need to generate the Gaussian mesh first
hm.generateGaussian = function(meanX, meanY, stdX, stdY) {
	var gaussianMesh = make2DMesh(config.meshSize*2);
	for (var i = 0; i < gaussianMesh.length; i++) {
		for (var j = 0;  j< gaussianMesh.length; j++) {
		gaussianMesh[i][j] = stats.gaussian2D((i - config.meshSize)*2*config.px2mm, (config.meshSize - j)*2*config.px2mm, meanX, meanY, stdX, stdY);
		}
	}
	return mesh.normaliseMesh(gaussianMesh);
}


/*
* Convolves a 2D, symmetric Gaussian with the dartboard
* function and writes the result to file in the
* symmetric directory
*/
hm.generateHeatmap = function(sd, mesh) {
	//creates nice progress bar in terminal
	priv.bar = new progressBar('sdX: '+sd.x.toFixed(1)+'mm, sdY: '+sd.y.toFixed(1)+'mm [:bar] :percent :etas', {
	    complete: '='
	  , incomplete: ' '
	  , width: 80
	  , total: mesh.length
	});
	var gaussianMesh = hm.generateGaussian;
	//start big loop
	var N = mesh.length;
	for (var x = -N/2; x < N/2; x++) {
		for (var y = -N/2; y < N/2; y++) {
			var pos = {
				'x': x*config.px2mm,
				'y': y*config.px2mm
			};
			mesh[x+N/2][N/2-y] = hm.weight(pos, sd, mesh);
		}
		//update progress bar
		priv.bar.tick();
	}
	//output data
	var fileName = 'sd-';
	if(sd.x<10) fileName += '0';
	if(sd.x<100) fileName += '0';
	fileName += sd.x.toFixed(1);
	fileName += '.json';
	files.writeToFile(mesh, fileName, 'public/data/new-symmetric/');
	//destroy progress bar
	priv.bar = null;
};

/*
* Calculates the value of each pixel of the heatmap
*/
hm.weight = function(pos, sd, mesh) {
	var N = mesh.length, sum = 0;
	for (var x = -N/2; x < N/2; x++) {
		for (var y = -N/2; y < N/2; y++) {
			//mesh[pixelX][pixelY] += db.dartboard(x, y) * stats.gaussian2D(x, y, pixelX, pixelY, sdX.px, sdY.px);
			sum += db.dartboard(x*config.px2mm, y*config.px2mm) * stats.gaussian2D(x*config.px2mm, y*config.px2mm, pos.x, pos.y, sd.x, sd.y);
		}
	}
	return sum;	
}

/*
*
*/
hm.generateHeatmapPartials = function(sd) {
	var N = mesh.length;
	//creates nice progress bar in terminal
	priv.bar = new progressBar('sd: '+sd.mm.toFixed(1)+'mm [:bar] :percent :etas', {
	    complete: '='
	  , incomplete: ' '
	  , width: 80
	  , total: mesh.length
	});
	//create x partial
	var dim = 'x';
	//start big loop
	for (var x = -N/2; x < N/2; x++) {
		for (var y = -N/2; y < N/2; y++) {
			var pos = {
				'x': x*config.px2mm,
				'y': y*config.px2mm
			};
			mesh[x+N/2][N/2-y] = app.partialWeight(pos, sd, mesh, dim);
		}
		//update progress bar
		if(x%2 == 0) priv.bar.tick();
	}
	//output data
	var dir = 'public/data/partial/'+dim+'/';
	var fileName = 'sd-';
	if(sd.mm<10) fileName += '0';
	if(sd.mm<100) fileName += '0';
	fileName += sd.mm.toFixed(1);
	fileName += '.json';
	files.writeToFile(fileName, dir);

	//create y partial
	mesh.zeroMesh(mesh);
	dim = 'y';
	//start big loop
	for (var x = -N/2; x < N/2; x++) {
		for (var y = -N/2; y < N/2; y++) {
			var pos = {
				'x': x*config.px2mm,
				'y': y*config.px2mm
			};
			mesh[x+N/2][y+N/2] = app.partialWeight(pos, sd, mesh, dim);
		}
		//update progress bar
		if(x%2 == 0) priv.bar.tick();
	}
	//output data
	var dir = 'public/data/partial/'+dim+'/';
	var fileName = 'sd-';
	if(sd.mm<10) fileName += '0';
	if(sd.mm<100) fileName += '0';
	fileName += sd.mm.toFixed(1);
	fileName += '.json';
	files.writeToFile(fileName, dir);
	//destroy progress bar
	priv.bar = null;
}

/*
* Calculates the partial weight of a pixel in the
* heatmap by convolving a 1D gaussian with the
* dartboard function either along the x or y axis
*/
hm.partialWeight = function(pos, sd, mesh, dim) {
	var N = mesh.length, sum = 0;
	switch(dim) {
		case 'x':
			for (var x = -N/2; x < N/2; x++) {
				//mesh[pixelX][pixelY] += db.dartboard(x, pixelY) * stats.gaussian1D(x, pixelX, sd.px);
				sum += db.dartboard(x*config.px2mm, pos.y) * stats.gaussian1D(x*config.px2mm, pos.y, sd.x);
			}
			return sum;
			break;
		case 'y':
			for (var y = -N/2; y < N/2; y++) {
				//mesh[pixelX][pixelY] += db.dartboard(pixelX, y) * stats.gaussian1D(y, pixelY, sd.px);
				sum += db.dartboard(pos.x, y*config.px2mm) * stats.gaussian1D(y*config.px2mm, pos.x, sd.y);
			}
			return sum;
			break;
	}
}

module.exports = hm;