(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var config = config || {};

config = {
	"meshSize": 200,
	"meshRatio": {
		"bullseye": 6.35/200,
		"bull" : 15.9/200,
		"innerTreble": 99/200,
		"outerTreble": 107/200,
		"innerDouble": 162/200,
		"outerDouble": 170/200
	}
};

module.exports = config;
},{}],2:[function(require,module,exports){
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
	//ycoord += ((config.meshSize/2) - 2*ycoord);
	ycoord = config.meshSize/2 - ycoord;
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
},{"./config.js":1}],3:[function(require,module,exports){
/*
* All private variables and functions are attached to the priv object
* which is not exported
*/

var priv = priv || {};

//stores previously calculated values of the factorial function
priv.f = [];

//stores previously calculated values of returnStdDev
priv.rSD = [1000];
// priv.rSD[0] = 1000 and represents the standard deviation for 0% of darts in bull.

/*
* All public variables and functions are attached to the stats object
* which is exported at the end of the module
*/
var stats = stats || {};
/*
* Returns the value of a 1D Gaussian PDF, centerd at meanX
* and standard deviations sdX, at x. When only x is
* provided as an argument it defaults to a normal distribution 
*/
stats.gaussian1D = function(x, meanX, sdX) {
	var meanX = meanX || 0;
	var sdX = sdX || 1;
	var varX = sdX*sdX;

  var m = stats.stdDev * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - stats.mean, 2) / (2 * stats.variance));
  return e / m;
}

/*
* Returns the value of a 2D Gaussian PDF, centerd at (meanX,meanY)
* and standard deviations sdX & sdY, at (x,y). When only x & y are
* provided as arguments it defaults to a normal distribution 
*/
stats.gaussian2D = function(x, y, meanX, meanY, sdX, sdY) {
	var meanX = meanX || 0;
	var meanY = meanY || 0;
	var sdX = sdX || 1;
	var sdY = sdY || 1;
	var varX = sdX*sdX;
	var varY = sdY*sdY;
	//check the normalisation constant
  var e = Math.exp( - ( Math.pow(x - meanX, 2) / (2 * varX) + Math.pow(y - meanY, 2) / (2 * varY) ) );
  var m = sdX * sdY * 2 * Math.PI;
  return ( (e / m) < 0.00000001 ? 0 : e/m );
}

// Currently going to have accuracy as a fraction rather than a percentage
stats.calcStandardDev = function(accuracy) {
	return config.meshSize*config.meshRatio.bullseye/0.4;
}

/*
* Returns th value of the error function, accurate to 9 decimal places
*/
stats.erf = function(x) {
	var k=0, el=0, sum=0;
	do {
		el = ( Math.pow(-1,k) / ( (2*k +1)*stats.factorial(k) ) ) * Math.pow(x, (2*k)+1);
		sum += el;
		k++;
	} while(Math.abs(el) > 0.000000001)
	var ans = ((2*sum/Math.sqrt(Math.PI))).toFixed(9);
	return (ans == 'NaN' ? 1 : ans);
}

stats.factorial = function(n) {
  if (n == 1 || n == 0)
    return 1;
  if (priv.f[n] > 0)
    return priv.f[n];
  return priv.f[n] = stats.factorial(n-1) * n;
}

/*
* returns the mean value of an array
*/
stats.mean = function(arr) {
	var total = 0;
	for (var i = arr.length - 1; i >= 0; i--) {
		total += arr[i];
	};
	return total/arr.length;
}

/*
* returns the standard deviation of an array
*/
stats.stdDev = function(arr, mean) {
	//if mean is not provided as an arg, calculate it
	var mean = mean || stats.mean(arr);
	var variance = 0;
	for (var i = arr.length - 1; i >= 0; i--) {
		variance += Math.pow((arr[i] - mean), 2);
	};
	return Math.sqrt(variance/arr.length);
}

// erf(n divided by root 2) = fraction of darts thrown contained within the n sigma
// interval.
// For a given percentage of darts within the bull, n values are trialled in the error
// function until one falls within an error bound of the percentage we want.
stats.returnStdDev = function(percentage) {
	trialn = 1; // erf(0) is not defined.
	percentage = Math.round(percentage*2)/2;
	if (priv.rSD[percentage*2] > 0) {
		return priv.rSD[percentage*2];
	}
	for (var i = 1; i <= percentage*2; i++) {
		var resultaccuracy = 0;
		do {
			resultaccuracy = stats.erf((trialn/1000)*Math.pow(2, -0.5));
			trialn += 1;
		}
		while (resultaccuracy < ((i/200) - 0.0005) || resultaccuracy > ((i/200) +0.0005))
	}
	return priv.rSD[percentage*2] = 1/((trialn/1000)-0.001);
}

module.exports = stats;
},{}],4:[function(require,module,exports){
var draw = draw || {};

/*
* Takes four arguments:
* context: the canvas context used to draw
* canvas: the canvas element that pertains to the context
* dim: a dimensions object of the form {height: 100, width: 100}
* displayNumbers: a bool to determine whether to draw bed values on the board
*/

draw.dartBoard = function(context, canvas, dim, displayNumbers) {
	//
	var dartboardnumbers = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];
	context.textAlign = "center"
	context.fillStyle = "#000";
	context.font = dim.width/25 + "px Helvetica";
	//set metrics
	var db = {};
	db.x = dim.width/2; // db.x is the central x coordinate.
	db.y = dim.height/2; // db.y is the central y coordinate.
	db.rad = dim.width/2;
	
	//treble ring
	draw.circle(context, db.x, db.y, db.rad*99/200);
	draw.circle(context, db.x, db.y, db.rad*107/200);
	//double ring
	draw.circle(context, db.x, db.y, db.rad*170/200);
	draw.circle(context, db.x, db.y, db.rad*162/200);
	//bull
	draw.circle(context, db.x, db.y, db.rad*6.35/200);
  draw.circle(context, db.x, db.y, db.rad*15.9/200);

	var theta, innerX, innerY, outerX, outerY;

	for (var i = 0; i < 20; i++) {
		theta = Math.PI/20 + i*(Math.PI/10);
		innerX = Math.round((db.rad*15.9/200) * Math.cos(theta) + db.x);
		innerY = Math.round(db.y - ((db.rad*15.9/200) * Math.sin(theta)));
		outerX = Math.round(((db.rad*170/200) * Math.cos(theta)) + db.x);
		outerY = Math.round(db.y - ((db.rad*170/200) * Math.sin(theta)));
		
		context.beginPath();
    context.moveTo(innerX, innerY);
  	context.lineTo(outerX, outerY);

	  if(displayNumbers) {
	  	theta -= Math.PI/20;
	  	outerX = Math.round(((db.rad*135/200) * Math.cos(theta)) + db.x);
			outerY = Math.round(db.y - ((db.rad*135/200) * Math.sin(theta)));
	  	context.fillText(dartboardnumbers[i], outerX, outerY);
		}
		context.stroke();
  }
}

/*
*
*/
draw.circle = function(ctx, x, y, rad) {
	ctx.beginPath();
	ctx.arc(x, y, rad, 0, Math.PI*2, true);
	ctx.stroke();
	ctx.closePath();
}

//a handy function to clear the canvas (X-browser friendly)
//http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
// http://jsfiddle.net/jeshuamaxey/YQP82/2/
draw.clear = function(context, canvas) {
	context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
  // context.fillStyle = "rgba(0,0,0,0.0)";
  // context.fillRect(0, 0, canvas.width, canvas.height);
};

module.exports = draw;
},{}],5:[function(require,module,exports){
//import modules
//window.config = require('../../modules/config.js');
window.stats = require('../../modules/stats.js');
window.db = require('../../modules/dartboard.js');

//shim the getUserMedia method
navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

//global namespace object
var app = app || {};
window.app = app;

//keeps track of whether the video stream is active
app.videoShowing = false;
//defines the settings for the video stream
app.videoContraints = {
	'audio': false,
	//'video': true,
	'video': {
    mandatory: {
      minWidth: 700,
      minHeight: 700
    }
  }
}

app.draw = require('./draw.js');

//these vars need initialising before any calibration to ensure
//calibrating works immediately
app.overlayRx = 0;
app.overlayRy = 0;
app.overlayRz = 0;
app.overlayTx = 0;
app.overlayTy = 0;
app.overlayPerspective = 1000;
app.overlayPx = 50;
app.overlayPy = 50;
//required to keep overlay in front of body
//this way all click events can be detected
app.overlayTz = 200;

/*
*	Called on page load
*/
app.main = function() {
	app.video = $('#vid')[0];
	app.overlay = $('#overlay');

	app.ovCanvas = app.overlay[0];
	app.ovCtx = app.ovCanvas.getContext('2d');

	$('#startStream').on('click', app.startVideo);
	$('#stopStream').on('click', app.stopVideo);
	$('#calibrate').on('click', app.initialiseCalib);
	$('#clearData').on('click', app.clearData);
	$('#undoDataClick').on('click', app.undoDataClick);
	$('#missedDart').on('click', app.missedDart);
	$('#reviewData').on('click', app.generateDataReview);

	$('#submitExport').on('click', app.submitExport);

	$('#overlayOpacity').on('change', app.updateOverlayOpacity);
}

/*
* Starts the viedo stream
*/
app.startVideo = function() {
	if(!app.videoShowing) {
		navigator.getUserMedia(app.videoContraints, function(stream) {
			app.videoShowing = true;
			app.stream = stream;
		  app.video.src = window.URL.createObjectURL(app.stream);
		}, function(err) {
			alert("ERROR: " + err);
		});
	}
}

/*
* Stops the viedo stream
*/
app.stopVideo = function() {
	app.videoShowing = false;
	app.stream.stop();
	app.video.src = '';
}

/*
* Initialises the calibration routine
*/
app.initialiseCalib = function() {
	$('.strikethrough').removeClass('strikethrough');
	$($('#calibClickInstructions li')[0]).addClass('clickHere')
	if(!app.videoShowing) {
		alert('You need to start the video before you can record any data');
		return 0;
	}
	//show the calibration UI
	$('#calibControls').show();
	//
	app.redrawGrid(app.ovCanvas, app.ovCtx);
	//
	app.calibClicks = [];
	app.dataClicks = app.dataClicks || [];
	
	$('#uncalibratedMessage').show()
	$('#uncalibratedMessage').html('CALIBRATING')
	$('#controls').show();

	$('.rotationSlider').on('change', app.updateRotation);
	$('#resetRotation').on('click', app.resetRotation);
	$('.translationSlider').on('change', app.updateTranslation);
	$('#resetTranslation').on('click', app.resetTranslation);
	$('.perspectiveSlider').on('change', app.updatePerspective);
	$('#resetPerspective').on('click', app.resetPerspective);
	$('#inputType').on('click', app.updateInputType)
	$('#calibClickDialog').show();
	app.overlay.unbind('click');
	app.overlay.on('click', app.calibClick);
}

/*
*	Records a single calibration click in and array and
* updates the calibration UI (there are 3 calibration clicks)
*/
app.calibClick = function(e) {
	$($('.calibClick')[app.calibClicks.length]).removeClass('clickHere').addClass('strikethrough');
	$($('.calibClick')[app.calibClicks.length+1]).addClass('clickHere')
	app.calibClicks.push(e);
	if(app.calibClicks.length == 3) {
		app.calculateCalibration()
	}
}

/*
*	Calculate the pixel to mm ratio and origin offset
* and hide the calibration UI
*/
app.calculateCalibration = function() {
	//calculate pixel to mm ratio
	var dx = Math.abs(app.calibClicks[0].offsetX - app.calibClicks[1].offsetX);
	var dy = Math.abs(app.calibClicks[0].offsetY - app.calibClicks[1].offsetY);
	var pxDiameter = Math.sqrt(dx*dx + dy*dy);
	var mmDiameter = 340; //in mm
	app.px2mm = mmDiameter / pxDiameter;
	//store origin offsets
	app.originOffset = {
		'x': app.calibClicks[2].offsetX,
		'y': app.calibClicks[2].offsetY
	}
	//end calibration
	$('#uncalibratedMessage, #calibClickDialog, #calibControls').hide();
	$('#recordClickDialog').show();
	app.overlay.unbind('click');
	app.overlay.on('click', app.recordClick);
	app.dbAfterCalib();
}

app.dbAfterCalib = function() {
	app.clearCanvas(app.ovCtx, app.ovCanvas);
	app.draw.dartBoard(app.ovCtx, app.ovCanvas);
}

/*
*	Record a click on the overlay as a throw and store
* for later export
*/
app.recordClick = function(e) {
	//find x,y in our coordinate system
	var x = e.offsetX - app.originOffset.x;
	var y = app.originOffset.y - e.offsetY;
	//create object to hold all the data for post analysis
	var attempt = {
		'pxX': x,
		'pxY': y,
		'pxR': Math.sqrt(x*x + y*y),
		'mmX': x*app.px2mm,
		'mmY': y*app.px2mm,
		'mmR': Math.sqrt(x*x + y*y)*app.px2mm
	};
	app.dataClicks.push(attempt);
	
	var cumulativeDist;
	if(app.dataClicks.length-1) {
		cumulativeDist = parseFloat($('#clickCoords tbody tr:first td:last').html()) + parseFloat(attempt.mmR.toFixed(2));
	} else {
		cumulativeDist = parseFloat(attempt.mmR.toFixed(2));
	}
	$('#clickCoords tbody').prepend("<tr>" +
																		"<td>" + app.dataClicks.length + "</td>" +
																		"<td>" + "db.dartboard(x,y)" + "</td>" +
																		"<td>" + "CumScore() "+ "</td>" +
																		"<td>" + attempt.mmR.toFixed(2) + "</td>" +
																		"<td>" + cumulativeDist.toFixed(2) + "</td>" +
																	"</tr>");
}

/*
* Process the export
* note: this uses stats functions found in stats.js
*/
app.submitExport = function(e) {
	//stop the form trying to submit (initially)
	e.preventDefault();

	//meta data about the collection process
	var meta = {
		'time': new Date(),
		'name': $('#exportForm #name').val(),
		'fileName': $('#exportForm #fileName').val(),
		'notes': $('#exportForm #notes').val(),
		'stints': $('#threeDartStints').is(':checked'),
		'units': $('#exportForm #numUnits').val() || 0
	}
	//the processed data
	var preprocessed = app.generateProcessedData();
	//the raw throw data and conversion ratio
	var raw = {
		'px2mm': app.px2mm,
		'throws' : app.dataClicks
	}
	//collect all the data to export
	var data = {
		'meta': meta,
		'preprocessed': preprocessed,
		'raw': raw,
	};
	
	//configure the AJAX call
	var settings = {
		'url': 'api/store',
		'type': 'post',
		'data': data
	}
	//make the call!
	$.ajax(settings).done(app.confirmExport);
}

/*
* Confirm the export and report success/failure
*/
app.confirmExport = function() {
	$('#exportDataDialog').hide();
	app.clearData();
	window.alert("Export Succesful. You go gurl");
}

/*
* Record a missed dart
*/
app.missedDart = function() {
	var x = 170, y = 170;
	var attempt = {
		'pxX': x,
		'pxY': y,
		'pxR': Math.sqrt(x*x + y*y),
		'mmX': x*app.px2mm,
		'mmY': y*app.px2mm,
		'mmR': Math.sqrt(x*x + y*y)*app.px2mm
	};
	app.dataClicks.push(attempt);
	$('#clickCoords tbody').prepend("<tr>" +
																		"<td>" + app.dataClicks.length + "</td>" +
																		"<td>" + "db.dartboard(x,y)" + "</td>" +
																		"<td>" + "CumScore() "+ "</td>" +
																		"<td>" + attempt.mmR.toFixed(2) + "</td>" +
																		"<td>" + "CumDist" + "</td>" +
																	"</tr>");
}

app.undoDataClick = function() {
	//remove last element from array
	app.dataClicks.splice(app.dataClicks.length-1);
	//remove corressponding entry in table
	$('#clickCoords tbody tr:first').remove();
}

/*
*	Clear the array of click data
*/
app.clearData = function() {
	//ARE YOU SURE?
	app.dataClicks = [];
	$('#clickCoords tbody').html('');
}

/*
*
*/
app.generateDataReview = function() {
	var data = app.generateProcessedData();
	var dim = ['X','Y','R'];
	//only fill table if there's data
	if(data) {
		for (var i = dim.length - 1; i >= 0; i--) {
			$('#stdDev'+ dim[i] ).html((data['mm'+ dim[i] ].stdDev).toFixed(4) + ' mm');
			$('#mean'+ dim[i] ).html((data['mm'+ dim[i] ].mean).toFixed(4) + ' mm');
		}
		//round standard deviation to the nearest 0.5
		var sd = Math.round(data.mmR.stdDev*2)/2;
		$('#goToHeatmap').attr('href', '/?sd='+sd).removeClass('disabled');
	} else {
		$('#goToHeatmap').addClass('disabled');
	}
}

/*
*
*/
app.generateProcessedData = function() {
	if(app.dataClicks == undefined || app.dataClicks.length == 0) {
		alert('no fackin datumz')
		return false;
	} else {
		var processedData = {};
		var val = ['mmR','mmX','mmY','pxR','pxX','pxY'];
		var arr = [];

		for (var i = val.length - 1; i >= 0; i--) {
			arr = [];
			processedData[val[i]] = {};
			//create an array of just the values we're interested in
			for (var j = app.dataClicks.length - 1; j >= 0; j--) {
				arr.push(app.dataClicks[j][val[i]])
			};
			processedData[val[i]].mean = stats.mean(arr)
			processedData[val[i]].stdDev = stats.stdDev(arr)
		};

		return processedData;
	}
}

/*
*	Rotation and translation functions
*/

app.updateRotation = function() {
	app.overlayRx = $('#xRotation').val();
	app.overlayRy = $('#yRotation').val();
	app.overlayRz = $('#zRotation').val();
	$('span#xRotationDisp').html(app.overlayRx);
	$('span#yRotationDisp').html(app.overlayRy);
	$('span#zRotationDisp').html(app.overlayRz);
	app.applyTransform()
}

app.updateTranslation = function() {
	app.overlayTx = $('#xTranslation').val();
	app.overlayTy = $('#yTranslation').val();
	$('span#xTranslationDisp').html(app.overlayTx);
	$('span#yTranslationDisp').html(app.overlayTy);
	app.applyTransform()
}

app.resetRotation = function() {
	app.overlayRx = 0;
	app.overlayRy = 0;
	app.overlayRz = 0;
	$('#xRotation').val(0)
	$('#yRotation').val(0)
	$('#zRotation').val(0)
	$('span#xRotationDisp').html(0);
	$('span#yRotationDisp').html(0);
	$('span#zRotationDisp').html(0);
	app.applyTransform()
}

app.resetTranslation = function() {
	app.overlayTx = 0;
	app.overlayTy = 0;
	$('#xTranslation').val(0)
	$('#yTranslation').val(0)
	$('#zTranslation').val(0)
	$('span#xTranslationDisp').html(0);
	$('span#yTranslationDisp').html(0);
	app.applyTransform()
}

app.updatePerspective = function() {
	console.log(99)
	//set vals
	app.overlayPerspective = $('#perspective').val();
	app.overlayPx = $('#xOrigin').val();
	app.overlayPy = $('#yOrigin').val();
	//set sliders
	$('#perspective').val(app.overlayPerspective);
	$('#xOrigin').val(app.overlayPx);
	$('#yOrigin').val(app.overlayPy);
	//set readouts
	$('span#perspectiveDisp').html(app.overlayPerspective);
	$('span#xOriginDisp').html(app.overlayPx+'%');
	$('span#yOriginDisp').html(app.overlayPy+'%');
	//apply
	app.applyTransform();
}

app.resetPerspective = function() {
	//set vals
	app.overlayPerspective = 1000;
	app.overlayPx = 50;
	app.overlayPy = 50;
	//set sliders
	$('#perspective').val(100);
	$('#xOrigin').val(100);
	$('#yOrigin').val(100);
	//set readouts
	$('span#perspectiveDisp').html(100);
	$('span#xOriginDisp').html(100+'%');
	$('span#yOriginDisp').html(100+'%');
	//apply
	app.applyTransform();
}

app.applyTransform = function() {
	$('#wrapper').css('-webkit-perspective-origin', app.overlayPx+'% '+ app.overlayPy+'%');
	$('#wrapper').css('-webkit-perspective', app.overlayPerspective + 'px');
	$('#overlay').css('-webkit-transform','translateX('+app.overlayTx+'px)'
																			+ 'translateY('+app.overlayTy+'px)'
																			+ 'translateZ('+app.overlayTz+'px)'
																			+	'rotateX('+app.overlayRx+'deg)'
																			+ 'rotateY('+app.overlayRy+'deg)'
																			+ 'rotateZ('+app.overlayRz+'deg)');
	$('#wrapper').css('-moz-perspective-origin', app.overlayPx+'% '+ app.overlayPy+'%');
	$('#wrapper').css('-moz-perspective', app.overlayPerspective + 'px');
	$('#overlay').css('-moz-transform','translateX('+app.overlayTx+'px)'
																			+ 'translateY('+app.overlayTy+'px)'
																			+ 'translateZ('+app.overlayTz+'px)'
																			+	'rotateX('+app.overlayRx+'deg)'
																			+ 'rotateY('+app.overlayRy+'deg)'
																			+ 'rotateZ('+app.overlayRz+'deg)');
}

app.updateOverlayOpacity = function() {
	var op = parseFloat($(this).val());
	$('#overlayOpacityDisp').html(op)
	$('#overlay').css('opacity', op);
}

app.updateInputType = function() {
	if($(this).is(':checked')) {
		$('#calibControls input[type=number]').attr('type','range');
	} else {
		$('#calibControls input[type=range]').attr('type','number');
	}
}

/*
*	Draws a radial grid on the overlay
*/
app.redrawGrid = function(canvas, ctx) {
	app.clearCanvas(ctx, canvas);

	var w = canvas.width;
	var h = canvas.height;

	var x = w/2;
	var y = h/2;

	var radInc = 45;//sumthin || 8;

	//draw radial grid
	for (var rad = 0; rad < w/2; rad += radInc) {
		app.drawCircle(ctx, x, y, rad)
	}

	//add cross hair
	ctx.moveTo(x, 0);
	ctx.lineTo(x, h);
	ctx.moveTo(0, y);
	ctx.lineTo(w, y);

	//add some text to keep track of fowards face
	ctx.font = '40pt Helvetica';
	ctx.fillText("THIS FACE FORWARDS", 200, 100)

	//draw it
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#ddd";
	ctx.stroke();
}

/*
*	Simple abstartion of the canvas arc function
* for drawing circles
*/
app.drawCircle = function(ctx, x, y, rad) {
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.arc(x, y, rad, 0, Math.PI*2, true);
	ctx.stroke();
	ctx.closePath();
}

/*
* A handy function to clear the canvas (X-browser friendly)
* http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
* can't get this to work although this jsfiddle does work???
* http://jsfiddle.net/jeshuamaxey/YQP82/2/
*/
app.clearCanvas = function(context, canvas) {
	context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
  // context.fillStyle = "rgba(0,0,0,0.0)";
  // context.fillRect(0, 0, canvas.width, canvas.height);
};

//must go last
$(document).ready(app.main);
},{"../../modules/dartboard.js":2,"../../modules/stats.js":3,"./draw.js":4}]},{},[5])