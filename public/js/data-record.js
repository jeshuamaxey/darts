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
app.overlayTz = 1000;

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
	$('#bounceOut').on('click', app.bounceOut);
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
	
	$('#uncalibratedMessage').html('CALIBRATING').show();
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
	if(app.calibClicks.length == 5) {
		app.calculateCalibration()
	}
}

/*
*	Calculate the pixel to mm ratio and origin offset
* and hide the calibration UI
*/
app.calculateCalibration = function() {
	app.px2mm = {};
	//calculate pixel to mm ratio in x
	var dx = Math.abs(app.calibClicks[0].offsetX - app.calibClicks[1].offsetX);
	var dy = Math.abs(app.calibClicks[0].offsetY - app.calibClicks[1].offsetY);
	var pxDiameter = Math.sqrt(dx*dx + dy*dy);
	var mmDiameter = 340; //in mm
	app.px2mm.x = mmDiameter / pxDiameter;
	//calculate pixel to mm ratio in x
	var dx = Math.abs(app.calibClicks[3].offsetX - app.calibClicks[4].offsetX);
	var dy = Math.abs(app.calibClicks[3].offsetY - app.calibClicks[4].offsetY);
	var pxDiameter = Math.sqrt(dx*dx + dy*dy);
	var mmDiameter = 340; //in mm
	app.px2mm.y = mmDiameter / pxDiameter;
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
	$('#overlay').on('mousemove', app.updateHoverCoords);
	app.clearCanvas(app.ovCtx, app.ovCanvas);
	app.draw.dartBoard(app.ovCtx, app.ovCanvas);
}

/*
*
*/
app.updateHoverCoords = function(e) {
	var x = e.offsetX - app.originOffset.x;
	var y = app.originOffset.y - e.offsetY;

	var pos = {
		'x': x*app.px2mm.x,
		'y': y*app.px2mm.y,
		'r': Math.sqrt( Math.pow(x*app.px2mm.x, 2.0) + Math.pow(y*app.px2mm.y, 2.0) )
	};
	//update display
	$('#hoverX').html(pos.x.toFixed(2)+'mm');
	$('#hoverY').html(pos.y.toFixed(2)+'mm');
	$('#hoverRadius').html(pos.r.toFixed(2)+'mm');
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
		'mmX': x*app.px2mm.x,
		'mmY': y*app.px2mm.y,
		'mmR': Math.sqrt( Math.pow(x*app.px2mm.x, 2.0) + Math.pow(y*app.px2mm.y, 2.0) )
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
		'px2mm': {
			x: app.px2mm.x,
			y: app.px2mm.y
		},
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
app.bounceOut = function() {
	var x = 170, y = 170;
	var attempt = {
		'bounceOut': true
	};
	app.dataClicks.push(attempt);
	$('#clickCoords tbody').prepend("<tr>" +
																		"<td>" + app.dataClicks.length + "</td>" +
																		"<td>" + "Bounce out" + "</td>" +
																		"<td>" + "CumScore()"+ "</td>" +
																		"<td>" + ":)" + "</td>" +
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
				//make sure to exclude bounce outs from the array
				if(!app.dataClicks[j].bounceOut) {
					arr.push(app.dataClicks[j][val[i]])
				} else {
					console.log("BOUNCE")
				}
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
	app.overlayTz = $('#zTranslation').val();
	$('span#xTranslationDisp').html(app.overlayTx);
	$('span#yTranslationDisp').html(app.overlayTy);
	$('span#zTranslationDisp').html(app.overlayTz);
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