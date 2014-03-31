// Objective: Return the chance of hitting each of the doubles.

var doubles = doubles || {};

var meshSize = 3000;

// Getting anomolous result. Chance of hitting 20 and 3 higher than 19 and 17 etc.
// Think this could be a resolution problem. Script needs changing to use a higher resolution.
// Ignore single and triple beds for the moment.

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

//x and y values used in this function will be pixel values.

fillDoubleShapeMesh = function(number) {
	mesh.zeroMesh(bedShapeMesh);
	if(number==6) {
	for (var x = -meshSize/2; x < meshSize/2; x++) {
			for (var y = -meshSize/2; y < meshSize/2; y++) {
				theta = db.findtheta(x*px2mm, y*px2mm);
				radius = db.findradius(x*px2mm, y*px2mm);
				if (radius < 170 && radius > 162 && (theta < Math.PI/20 || theta > 39*Math.PI/20)) {
					bedShapeMesh[x-Math.round(166*mm2px*Math.cos(0))+meshSize/2][meshSize/2-y]=1;
				}
			}
		}
	}
	else {
		segmentAngle = AngleOfSegment(number);
		for (var x = -meshSize/2; x < meshSize/2; x++) {
			for (var y = -meshSize/2; y < meshSize/2; y++) {
				theta = db.findtheta(x*px2mm, y*px2mm);
				radius = db.findradius(x*px2mm, y*px2mm);
				if (radius < 170 && radius > 162 && theta < (segmentAngle + Math.PI/20) && theta > (segmentAngle - Math.PI/20)) {
					bedShapeMesh[x-Math.round(166*mm2px*Math.cos(segmentAngle))+meshSize/2][meshSize/2-y+Math.round(166*mm2px*Math.sin(segmentAngle))]=1;
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

/*
* Exported functions
*/

/*
* Given a player's mean and sd, it returns the probability that
* player will hit the double bed of the number argument
*/
doubles.chance = function(number, sd, mean) {
	//set defaults when no gaussian params given
	sd = sd || {'x':1, 'y':1};
	mean = mean || {'x':0, 'y':0};
	//create and normailse the gaussian mesh of this player
	fillGaussianMesh(mean.x, mean.y, sd.y, sd.y);
	mesh.normaliseMesh(gaussianMesh);
	//do some mesh stuff that jack wrote to determine prob
	fillDoubleShapeMesh(number);
	fillResultMesh();
	//return probability
	return mesh.sumMesh(resultMesh);
}

module.exports = doubles;