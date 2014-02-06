var fs = require('fs');
var config = require('./config.js');
/*
* All private variables and functions are attached to the priv object
* which is not exported
*/

var priv = priv || {};

/*
* a 2D array w/ the same size as the mesh stores
*	previously calculated values of the dartboard function
*/
priv.db = new Array(config.meshSize);
for (var i = priv.db.length - 1; i >= 0; i--) {
	priv.db[i] = new Array(config.meshSize);
}


/*
* All public variables and functions are attached to the db object
* which is exported at the end of the module
*/

var db = db || {};

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
	//first look at private array to see if we've
	//calculated this value before
	var mesh = {'x': xcoord, 'y': ycoord};
	if(priv.db[mesh.x][mesh.y] != undefined) {
		return priv.db[mesh.x][mesh.y];
	}
	//else calculate the value
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
	
	if (radius <= (config.meshSize/2)*config.meshRatio.bullseye) {
		// Bullseye
		//store in private array before returning
		return priv.db[mesh.x][mesh.y] = 50;
	}
	
	else if (radius > (config.meshSize/2)*config.meshRatio.outerDouble) {
		// Missed Board
		//store in private array before returning
		return priv.db[mesh.x][mesh.y] = 0;
	}
	
	else if (radius <= (config.meshSize/2)*config.meshRatio.bull) {
		// Single Bull
		//store in private array before returning
		return priv.db[mesh.x][mesh.y] = 25;
	}
	
	else if (radius > (config.meshSize/2)*config.meshRatio.innerDouble && radius <= (config.meshSize/2)*config.meshRatio.outerDouble) {
		// Double
		dubtripfactor = 2;
	}
	
	else if (radius > (config.meshSize/2)*config.meshRatio.innerTreble && radius <= (config.meshSize/2)*config.meshRatio.outerTreble) {
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
	//store in private array
	return priv.db[mesh.x][mesh.y] = number*dubtripfactor;
}

/*
db.wt = 0.75; // Half of wire thickness of 1.5mm

db.wireboard = function(x, y) {
	var radius = db.findradius(x, y);
	var theta = db.findtheta(x, y);
	
	if (radius > (config.meshSize/2)*config.meshRatio.bullseye - db.wt &&
		radius < (config.meshSize/2)*config.meshRatio.bullseye + db.wt) {
		return 1;
		}
	if (radius > (config.meshSize/2)*config.meshRatio.outerDouble - db.wt &&
		radius < (config.meshSize/2)*config.meshRatio.outerDouble + db.wt) {
		return 1;
		}
	if (radius > (config.meshSize/2)*config.meshRatio.innerDouble - db.wt &&
		radius < (config.meshSize/2)*config.meshRatio.innerDouble + db.wt) {
		return 1;
		}
	if (radius > (config.meshSize/2)*config.meshRatio.innerTreble - db.wt &&
		radius < (config.meshSize/2)*config.meshRatio.innerTreble + db.wt) {
		return 1;
		}
	if (radius > (config.meshSize/2)*config.meshRatio.outerTreble - db.wt &&
		radius < (config.meshSize/2)*config.meshRatio.outerTreble + db.wt) {
		return 1;
		}
	if (radius > (config.meshSize/2)*config.meshRatio.bull - db.wt &&
		radius < (config.meshSize/2)*config.meshRatio.bull + db.wt) {
		return 1;
		}
}
*/
	

module.exports = db;

		
	
	
	
	
	
	
		


