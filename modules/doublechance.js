// Objective: Return the chance of hitting each of the doubles.

// This script only currrently works with mesh sizes of 400.
var meshSize = 400;

// Bring in required modules
var fs = require('fs');
var files = require('./files.js')
var db = require('./dartboard.js')
var stats = require('./stats.js')
var mesh = require('./mesh.js')

var mm2px = meshSize/400;
var px2mm = 1/mm2px;

var dartboardnumbers = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];

AngleOfSegment = function(number) {
		for (var i=0; i<dartboardnumbers.length; i++) {
			if (dartboardnumbers[i] == number) {
				return i*Math.PI/10;
			}
		}	
}

var gaussianMesh = mesh.make2DMesh(meshSize);
mesh.zeroMesh(gaussianMesh);
var bedShapeMesh = mesh.make2DMesh(meshSize);
var resultMesh = mesh.make2DMesh(meshSize);

var theta, radius, segmentAngle;

fillDoubleShapeMesh = function(number) {
	mesh.zeroMesh(bedShapeMesh);
	if(number==6) {
	for (var x = -meshSize/2; x < meshSize/2; x++) {
			for (var y = -meshSize/2; y < meshSize/2; y++) {
				theta = db.findtheta(x, y);
				radius = db.findradius(x, y);
				if (radius < 170 && radius > 162 && (theta < Math.PI/20 || theta > 39*Math.PI/20)) {
					bedShapeMesh[x-Math.round(166*Math.cos(0))+meshSize/2][meshSize/2-y]=1;
				}
			}
		}
	}
	else {
		segmentAngle = AngleOfSegment(number);
		for (var x = -meshSize/2; x < meshSize/2; x++) {
			for (var y = -meshSize/2; y < meshSize/2; y++) {
				theta = db.findtheta(x, y);
				radius = db.findradius(x, y);
				if (radius < 170 && radius > 162 && theta < (segmentAngle + Math.PI/20) && theta > (segmentAngle - Math.PI/20)) {
					bedShapeMesh[x-Math.round(166*Math.cos(segmentAngle))+meshSize/2][meshSize/2-y+Math.round(166*Math.sin(segmentAngle))]=1;
				}
			}
		}
	}
}

fillTripleShapeMesh = function(number) {
	mesh.zeroMesh(bedShapeMesh);
	if(number==6) {
	for (var x = -meshSize/2; x < meshSize/2; x++) {
			for (var y = -meshSize/2; y < meshSize/2; y++) {
				theta = db.findtheta(x, y);
				radius = db.findradius(x, y);
				if (radius < 107 && radius > 99 && (theta < Math.PI/20 || theta > 39*Math.PI/20)) {
					bedShapeMesh[x-Math.round(103*Math.cos(0))+meshSize/2][meshSize/2-y]=1;
				}
			}
		}
	}
	else {
		segmentAngle = AngleOfSegment(number);
		for (var x = -meshSize/2; x < meshSize/2; x++) {
			for (var y = -meshSize/2; y < meshSize/2; y++) {
				theta = db.findtheta(x, y);
				radius = db.findradius(x, y);
				if (radius < 107 && radius > 99 && theta < (segmentAngle + Math.PI/20) && theta > (segmentAngle - Math.PI/20)) {
					bedShapeMesh[x-Math.round(103*Math.cos(segmentAngle))+meshSize/2][meshSize/2-y+Math.round(103*Math.sin(segmentAngle))]=1;
				}
			}
		}
	}
}

fillSingleShapeMesh = function(number) {
	mesh.zeroMesh(bedShapeMesh);
	if(number==6) {
	for (var x = -meshSize/2; x < meshSize/2; x++) {
			for (var y = -meshSize/2; y < meshSize/2; y++) {
				theta = db.findtheta(x, y);
				radius = db.findradius(x, y);
				if (((radius < 162 && radius > 107) || (radius < 99 && radius > 31.8)) && (theta < Math.PI/20 || theta > 39*Math.PI/20)) {
					bedShapeMesh[x-Math.round(134.5*Math.cos(0))+meshSize/2][meshSize/2-y]=1;
				}
			}
		}
	}
	else {
		segmentAngle = AngleOfSegment(number);
		for (var x = -meshSize/2; x < meshSize/2; x++) {
			for (var y = -meshSize/2; y < meshSize/2; y++) {
				theta = db.findtheta(x, y);
				radius = db.findradius(x, y);
				if (((radius < 162 && radius > 107) || (radius < 99 && radius > 31.8))
				&& (theta < segmentAngle + Math.PI/20 && theta > segmentAngle - Math.PI/20)) {
					bedShapeMesh[x-Math.round(134.5*Math.cos(segmentAngle))+meshSize/2][meshSize/2-y+Math.round(134.5*Math.sin(segmentAngle))]=1;
				}
			}
		}
	}
}

fillGaussianMesh = function(meanX, meanY, stdDevX, stdDevY) {
	for (var x = -meshSize/2; x < meshSize/2; x++) {
		for (var y = -meshSize/2; y < meshSize/2; y++) {
			gaussianMesh[x+meshSize/2][meshSize/2-y] = stats.gaussian2D(x*px2mm, y*px2mm, meanX, meanY, stdDevX, stdDevY);
		}
	}
}

fillResultMesh = function() {
	for (var x = 0; x < meshSize; x++) {
		for (var y = 0; y < meshSize; y++) {
			resultMesh[x][y] = gaussianMesh[x][y]*bedShapeMesh[x][y];
		}
	}
}

// Let's check we are creating the right shaped beds.


fillGaussianMesh(9.5, -4.6, 34.8, 34.2);
mesh.normaliseMesh(gaussianMesh);
files.writeToFile(gaussianMesh, "gaussianTest.json", "./../public/data/Jack/doubles/");

for (var i=1; i<21; i++) {
	fillDoubleShapeMesh(i);
	fillResultMesh();
	files.writeToFile(bedShapeMesh, "bedshape"+i+".json", "./../public/data/Jack/doubles/");
	files.writeToFile(resultMesh, "resultfor"+i+".json", "./../public/data/Jack/doubles/");
	console.log("Chance of hitting double "+i+": "+mesh.sumMesh(resultMesh)*100+'%');
}