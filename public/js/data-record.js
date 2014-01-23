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
	$('#calibrate').on('click', app.calibrate);
	$('#exportData').on('click', app.exportData);
	$('#clearCoords').on('click', app.clearCoords);
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
		  app.initialiseCalib();
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
	app.calibClicks = [];
	$('#controls').show();

	$('.rotationSlider').on('change', app.updateRotation);
	$('#resetRotation').on('click', app.resetRotation);
	$('.translationSlider').on('change', app.updateTranslation);
	$('#resetTranslation').on('click', app.resetTranslation);
	
	app.overlay.on('click', app.recordClick);
}

app.calculateCalibration = function() {
	console.log(app.calibClicks)
	// //convert to cartisian coords centred on the bull
	// click = {'x' : e.offsetX, 'y' : e.offsetY}
}

app.recordClick = function(e) {
	console.log(e.offsetX, e.offsetY);
	//record calibration point data
	app.calibClicks.push(e);
	$('#clickCoords').append("<li>"+e.offsetX + ", " + e.offsetY+"</li>");
}

app.calibrate = function() {

}

app.exportData = function() {

}

app.clearCoords = function() {
	$('#clickCoords').html('');
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

app.redrawGrid = function(canvas, ctx) {
	var w = canvas.width;
	var h = canvas.height;

	var x = w/2;
	var y = h/2;

	//draw radial grid
	for (var rad = 0; rad < w/2; rad += 8) {
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