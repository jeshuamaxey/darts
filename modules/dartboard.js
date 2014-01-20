var db = db || {}; 

var fs = require('fs');
var config = require('./config.js');

db.findradius = function(xcoord, ycoord) {
    return Math.sqrt((xcoord*xcoord)+(ycoord*ycoord));
}

db.findtheta = function(xcoord, ycoord) {
    // Need to Correct for each quadrant else arctan(-x/-y) returns same as arctan(x/y)
    var correction = 0;
    if (xcoord < 0) {
        correction = Math.PI;
    }
    else if (ycoord < 0) {
        correction = 2*(Math.PI);
    }
    return Math.atan(ycoord/xcoord) + correction;
}

db.dartboard = function(xcoord, ycoord) {
	//shift x,y array index to coord system centred on the bull
	xcoord -= config.meshSize/2;
	ycoord += ((config.meshSize/2) - 2*ycoord);
	// Coordinate system has origin at the centre of the bullseye
    var dartboardnumbers = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10,6];
    // The list of dartboard numbers starting at 6 and moving anticlockwise
	var radius = db.findradius(xcoord, ycoord);
	var theta = db.findtheta(xcoord, ycoord);
	var segmentcounter =0;
    var dubtripfactor = 1;
    // dubtripfactor is scaling factor for double/treble beds.
    
    // Wire thickness not considered. If a dart lands on the exact position of the wire
    // the darts always comes onto the inside of the circle.
	
	if (radius <= config.meshSize/53.5433070866) {
	// Bullseye
		return 50;
	}
	
	else if (radius > config.meshSize/2) {
	// Missed Board
		return 0;
	}
	
	else if (radius <= config.meshSize/21.3836477987) {
	// Single Bull
		return 25;
	}
	
	else if (radius > config.meshSize/2.0987654321 && radius <= config.meshSize/2) {
	// Double
		dubtripfactor = 2;
	}
	
	else if (radius > config.meshSize/3.43434343434 && radius <= config.meshSize/3.17757009346) {
	// Triple
		dubtripfactor = 3;
	}
	
	while (theta > (Math.PI/20)) {
	// theta = 0 is defined as the horizontal line running through 6.
	// Each Number has has an angle of pi/10
	// theta > pi/20 means the coordinates are further anticlockwise than 6.
		theta = theta-(Math.PI/10);
		segmentcounter += 1;
	}
	
	number = dartboardnumbers[segmentcounter];
	return number*dubtripfactor;
}

module.exports = db;

		
	
	
	
	
	
	
		


