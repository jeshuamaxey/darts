var doubles = require('../modules/doubles.js');

// Let's check we are creating the right shaped beds.

// fillGaussianMesh(0, 0, 43.1, 51.9);
// mesh.normaliseMesh(gaussianMesh);
// console.log(mesh.sumMesh(gaussianMesh));
// files.writeToFile(gaussianMesh, "gaussianTest.json", "./../public/data/Jack/doubles/");

var dartboardnumbers = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];

sd = {
	'x': 43.1,
	'y': 51.9
};

for (var i=0; i<dartboardnumbers.length; i++) {
	// fillDoubleShapeMesh(dartboardnumbers[i]);
	// fillResultMesh();
	// files.writeToFile(bedShapeMesh, "bedshape"+dartboardnumbers[i]+".json", "./../public/data/Jack/doubles/");
	// files.writeToFile(resultMesh, "resultfor"+dartboardnumbers[i]+".json", "./../public/data/Jack/doubles/");
	console.time(''+i);
	//console.log(dartboardnumbers[i]+", "+mesh.sumMesh(resultMesh));
	console.log(dartboardnumbers[i] + ", " + doubles.chance(dartboardnumbers[i], sd));
	console.timeEnd(''+i);
};