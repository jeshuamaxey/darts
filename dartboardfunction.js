function findradius(xcoord, ycoord) {
    return Math.sqrt((xcoord*xcoord)+(ycoord*ycoord));
}

function findtheta(xcoord, ycoord) {
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

function dartboard(xcoord, ycoord) {
    var dartboardnumbers = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10,6];
    // The list of dartboard numbers starting at 6 and moving anticlockwise
	var radius = findradius(xcoord, ycoord);
	var theta = findtheta(xcoord, ycoord);
	var segmentcounter =0;
    var dubtripfactor = 1;
    // dubtripfactor is scaling factor for double/treble beds.
    
    // Wire thickness not considered. If a dart lands on the exact position of the wire
    // the darts always comes onto the inside of the circle.
	
	if (radius <= 6.35) {
	// Bullseye
		return 50;
	}
	
	else if (radius > 170) {
	// Missed Board
		return 0;
	}
	
	else if (radius <= 15.9) {
	// Single Bull
		return 25;
	}
	
	else if (radius > 162 && radius <= 170) {
	// Double
		dubtripfactor = 2;
	}
	
	else if (radius > 99 && radius <= 107) {
	// Triple
		dubtripfactor = 3;
	}
	
	while (theta > (Math.PI/20)) {
	// theta = 0 is defined as the horizontal line running through 6.
	// Each Number has has an angle of pi/10
	// theta > pi/10 means the coordinates are further anticlockwise than 6.
		theta = theta-(Math.PI/10);
		segmentcounter += 1;
	}
	
	number = dartboardnumbers[segmentcounter];
	return number*dubtripfactor;
}

var testvalue = dartboard(16,-20);
console.log("you scored: " + testvalue);

		
	
	
	
	
	
	
		

