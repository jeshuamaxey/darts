var db = require('.././darts/modules/dartboard.js');
var stats = require('.././darts/modules/stats.js');
var fs = require('fs');

var meshSize = 200;
mm2px = meshSize/400;
px2mm = 1/mm2px;

//This means weight should be called 100x100 = 10,000 times

// This is the writeToFile function Josh wrote
// It has not been touched

writeToFile = function(fileName, dir, array) {
	outFile = (dir || 'public/data/') + (fileName || 'output.json');

	fs.writeFile(outFile, JSON.stringify(array, null, 2), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      //console.log("JSON saved to " + outFile);
	    }
	});

}

// This is the make2DMesh function Josh wrote
// It has not been touched

make2DMesh = function(size) {
	var arr = new Array(size);
	for (var i = arr.length - 1; i >= 0; i--) {
		arr[i] = new Array(size);
	}
	return arr;
}

sumMesh = function(mesh) {
	var sum = 0;
	for (var x = 0; x < mesh.length; x++) {
		for (var y = 0; y < mesh[x].length; y++) {
			sum = sum + mesh[x][y];
		}
	}
	return sum;
}

var sd = 1;


var dartboardMesh = make2DMesh(meshSize)
var gaussianMesh = make2DMesh(meshSize*2);
var resultMesh = make2DMesh(meshSize);

// Populate a mesh with the Gaussian as part of the normalisation factor calculation

for (var i = 0; i < gaussianMesh.length; i++) {
	for (var j = 0;  j< gaussianMesh.length; j++) {
		gaussianMesh[i][j] = stats.gaussian2D((i - meshSize)*2*px2mm, (meshSize - j)*2*px2mm, 9.5, -4.6, 34.8, 34.2);
	}
}

var normalisation = sumMesh(gaussianMesh);

for (var i = 0; i < gaussianMesh.length; i++) {
	for (var j = 0;  j< gaussianMesh.length; j++) {
		gaussianMesh[i][j] = gaussianMesh[i][j]/normalisation
	}
}

console.log(normalisation);

// Populate a mesh with the dartboard function

for (var i = 0; i < meshSize; i++) {
	for (var j = 0;  j< meshSize; j++) {
		dartboardMesh[i][j] = db.dartboard((i-meshSize/2)*px2mm, (meshSize/2-j)*px2mm);
	}
}

// weight takes mm values of an x y coordinate system centred on the bull

weight = function(xPixel, yPixel) {
	var sum = 0;
	for (var i = 0; i < meshSize; i++) {
		for (var j = 0; j < meshSize; j++) {
			sum += dartboardMesh[i][j] * gaussianMesh[meshSize - xPixel + i][meshSize + j - yPixel];
		}
	}

	return sum;
}

for (var i = 0; i < meshSize; i++) {
	for (var j = 0;  j< meshSize; j++) {
		resultMesh[i][j] = weight(i, j);
	}
	console.log(i);
}

writeToFile("CHTMesh.json", "../darts/public/data/Jack/", resultMesh);