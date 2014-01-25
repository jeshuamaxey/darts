//shim the getUserMedia method
navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

//global namespace object
var app = app || {};

app.videoShowing = false;

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

	$('#submitExport').on('click', app.submitExport);

	$('#overlayOpacity').on('change', app.updateOverlayOpacity);
}

/*
* VIDEO FUNCTIONS
*/
app.startVideo = function() {
	if(!app.videoShowing) {
		navigator.getUserMedia(app.videoContraints, function(stream) {
			app.videoShowing = true;
			app.stream = stream;
		  app.video.src = window.URL.createObjectURL(app.stream);
		}, app.errorCallback);
	}
}

app.stopVideo = function() {
	app.videoShowing = false;
	app.stream.stop();
	app.video.src = '';
}

app.errorCallback = function(err) {
	alert(err)
}

/*
* CALIBRATION FUNCTIONS
*/
app.initialiseCalib = function() {
	if(!app.videoShowing) {
		alert('You need to start the video before you can record any data');
		return 0;
	}
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

app.calibClick = function(e) {
	$($('.calibClick')[app.calibClicks.length]).removeClass('clickHere').addClass('strikethrough');
	$($('.calibClick')[app.calibClicks.length+1]).addClass('clickHere')
	app.calibClicks.push(e);
	if(app.calibClicks.length == 3) {
		app.calculateCalibration()
	}
}

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
	$('#uncalibratedMessage').hide();
	$('#calibClickDialog').hide();
	$('#recordClickDialog').show();
	app.overlay.unbind('click');
	app.overlay.on('click', app.recordClick);
}

/*
*
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
	$('#clickCoords').append("<li>("+x+ ", "+y+") - "+(attempt.mmR).toFixed(2)+"mm from bull.</li>");
}

app.showExportDialog = function() {
	$('#exportDataDialog').show();
}

app.clearData = function() {
	//ARE YOU SURE?
	// app.dataClicks = [];
	// $('#clickCoords').html('');
}

app.submitExport = function(e) {
	e.preventDefault();

	var data = {
		'name': $('#exportForm #name').val(),
		'fileName': $('#exportForm #fileName').val(),
		'throws' : app.dataClicks,
		'px2mm': app.px2mm
	};

	console.log("Exported data: " + data);
	
	var settings = {
		'url': 'api/store',
		'type': 'post',
		'data': data
	}

	$.ajax(settings).done(app.confirmExport);
}

app.confirmExport = function() {
	alert("Export Succesful. You go gurl");
}

/*
*	ROTATION AND TRANSLATION FUNCTIONS
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

	//	cartesian grid lines
	// for (var x = 0; x < w; x += 10) {
	//   ctx.moveTo(x, 0);
	//   ctx.lineTo(x, h);
	// }

	// for (var y = 0.5; y < h; y += 10) {
	//   ctx.moveTo(0, y);
	//   ctx.lineTo(w, y);
	// }

	//draw it
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#ddd";
	ctx.stroke();
}

//a handy function to clear the canvas (X-browser friendly)
//http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
//can't get this to work although this jsfiddle does work???
// http://jsfiddle.net/jeshuamaxey/YQP82/2/
app.clearCanvas = function(context, canvas) {
	context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
  // context.fillStyle = "rgba(0,0,0,0.0)";
  // context.fillRect(0, 0, canvas.width, canvas.height);
};

app.drawCircle = function(ctx, x, y, rad) {
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.arc(x, y, rad, 0, Math.PI*2, true);
	ctx.stroke();
	ctx.closePath();
}

//must go last
$(document).ready(app.main);