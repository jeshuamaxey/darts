//shim the getUserMedia method
navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

//global namespace object
var app = app || {};

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

//these vars need initialising before any calibration to ensure
//calibrating works immediately
app.overlayRx = 0;
app.overlayRy = 0;
app.overlayRz = 0;
app.overlayTx = 0;
app.overlayTy = 0;
//required to keep overlay in front of body
//this way all click events can be detected
app.overlayTz = 2000;

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
	$('#showExportDialog').on('click', app.showExportDialog);
	$('#clearData').on('click', app.clearData);
	$('#missedDart').on('click', app.missedDart);

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
	var mmDiameter = 451; //in mm
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
}

/*
*	Record a click on the overlay as a throw and store
* for later export
*/
app.recordClick = function(e) {
	//find x,y in our coordinate system
	var x = e.offsetX - app.originOffset.x;
	var y = e.offsetY - app.originOffset.y;
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
	$('#clickCoords').prepend("<li>("+x+ ", "+y+") - "+(attempt.mmR).toFixed(2)+"mm from bull.</li>");
}

/*
* Bring up the export options
*/
app.showExportDialog = function() {
	$('#exportDataDialog').show();
}

/*
* Process the export
*/
app.submitExport = function(e) {
	//stop the form trying to submit (initially)
	e.preventDefault();
	//collect all the data to export
	var data = {
		'name': $('#exportForm #name').val(),
		'fileName': $('#exportForm #fileName').val(),
		'notes': $('#exportForm #notes').val(),
		'px2mm': app.px2mm,
		'units': $('#numUnits').val() || 0,
		'stints': $('#threeDartStints').is(':checked'),
		'time': new Date(),
		'throws' : app.dataClicks
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
	$('#clickCoords').prepend("<li>MISS</li>");
	app.dataClicks.push("NaN");
}

/*
*	Clear the array of click data
*/
app.clearData = function() {
	//ARE YOU SURE?
	app.dataClicks = [];
	$('#clickCoords').html('');
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
	$('#overlay').css('-webkit-transform','translateX('+app.overlayTx+'px)'
																			+ 'translateY('+app.overlayTy+'px)'
																			+ 'translateZ('+app.overlayTz+'px)'
																			+	'rotateX('+app.overlayRx+'deg)'
																			+ 'rotateY('+app.overlayRy+'deg)'
																			+ 'rotateZ('+app.overlayRz+'deg)');
}

app.updateTranslation = function() {
	app.overlayTx = $('#xTranslation').val();
	app.overlayTy = $('#yTranslation').val();
	$('span#xTranslationDisp').html(app.overlayTx);
	$('span#yTranslationDisp').html(app.overlayTy);
	$('#overlay').css('-webkit-transform','translateX('+app.overlayTx+'px)'
																			+ 'translateY('+app.overlayTy+'px)'
																			+ 'translateZ('+app.overlayTz+'px)'
																			+	'rotateX('+app.overlayRx+'deg)'
																			+ 'rotateY('+app.overlayRy+'deg)'
																			+ 'rotateZ('+app.overlayRz+'deg)');
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
	$('#overlay').css('-webkit-transform','translateX('+app.overlayTx+'px)'
																			+ 'translateY('+app.overlayTy+'px)'
																			+ 'translateZ('+app.overlayTz+'px)'
																			+	'rotateX('+app.overlayRx+'deg)'
																			+ 'rotateY('+app.overlayRy+'deg)'
																			+ 'rotateZ('+app.overlayRz+'deg)');
}

app.resetTranslation = function() {
	app.overlayTx = 0;
	app.overlayTy = 0;
	$('#xTranslation').val(0)
	$('#yTranslation').val(0)
	$('#zTranslation').val(0)
	$('span#xTranslationDisp').html(0);
	$('span#yTranslationDisp').html(0);
	$('#overlay').css('-webkit-transform','translateX('+app.overlayTx+'px)'
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

/*
*	Draws a radial grid on the overlay
*/
app.redrawGrid = function(canvas, ctx) {
	app.clearCanvas(ctx, canvas);

	var w = canvas.width;
	var h = canvas.height;

	var x = w/2;
	var y = h/2;

	var radInc = 15;//sumthin || 8;

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