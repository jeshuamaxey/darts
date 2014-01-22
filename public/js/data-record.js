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

app.overlayRy = 0;
app.overlayRx = 0;

app.main = function() {
	app.video = $('#vid')[0];
	app.overlay = $('#overlay');

	app.ovCanvas = app.overlay[0];
	app.ovCtx = app.ovCanvas.getContext('2d');

	$('#startStream').on('click', app.startVideo);
	$('#stopStream').on('click', app.stopVideo);
	$('#startCalib').on('click', app.startCalib);
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
app.startCalib = function() {
	if(!app.videoShowing) {
		alert('You need to start the video before you can calibrate');
		return 0;
	}
	app.redrawGrid(app.ovCanvas, app.ovCtx);
	app.calibClicks = [];
	$('#calibDialog').show();
	$('#yRotation').on('change', app.updateRotation);
	$('#xRotation').on('change', app.updateRotation);
	$('#resetRotation').on('click', app.resetRotation)
	app.overlay.on('click', app.recordClick);
}

app.calculateCalibration = function() {
	console.log(app.calibClicks)
	// //convert to cartisian coords centred on the bull
	// click = {'x' : e.offsetX, 'y' : e.offsetY}
}

app.recordClick = function(e) {
	console.log(e.offsetX, e.offsetY)
	//record calibration point data
	app.calibClicks.push(e);
	//update calibration dialog
	$('#calibPoints li.clickHere').removeClass('clickHere').addClass('clicked');
	$($('#calibPoints li')[app.calibClicks.length]).addClass('clickHere');
	//if we have all the calibration points, unbind the event handler and calculate
	if(app.calibClicks.length==5) {
		app.calculateCalibration();
		app.overlay.unbind('click');
	}
}

app.updateRotation = function() {
	app.overlayRx = $('#xRotation').val()
	app.overlayRy = $('#yRotation').val()
	$('span#xRotationDisp').html(app.overlayRx);
	$('span#yRotationDisp').html(app.overlayRy);
	$('#overlay').css('-webkit-transform','rotateX('+app.overlayRx+'deg) rotateY('+app.overlayRy+'deg)')
}

app.resetRotation = function() {
	$('span#yRotationDisp').html(0);
	$('span#xRotationDisp').html(0);
	$('#overlay').css('-webkit-transform','rotateX('+0+'deg) rotateY('+0+'deg)')
}

app.redrawGrid = function(canvas, ctx) {
	var w = canvas.width;
	var h = canvas.height;

	var x = w/2;
	var y = h/2;

	for (var rad = 0; rad < w/2; rad += 8) {
		app.drawCircle(ctx, x, y, rad)
	}

	//add some text to keep track of fowards face
	ctx.fillText("THIS FACE FORWARDS", 10, 10)

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

app.drawCircle = function(ctx, x, y, rad) {
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.arc(x, y, rad, 0, Math.PI*2, true);
	ctx.stroke();
	ctx.closePath();
}

//must go last
$(document).ready(app.main);