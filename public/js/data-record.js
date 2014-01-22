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

app.main = function() {
	app.video = $('#vid')[0];
	app.overlay = $('#overlay');

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
	app.calibClicks = [];
	$('#calibDialog').show();
	app.overlay.on('click', app.recordClick);
}

app.calculateCalibration = function() {
	console.log(app.calibClicks)
	// //convert to cartisian coords centred on the bull
	// click = {'x' : e.offsetX, 'y' : e.offsetY}
}

app.recordClick = function(e) {
	console.log('testing')
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

//must go last
$(document).ready(app.main);