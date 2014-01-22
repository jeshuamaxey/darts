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
	$('#startStream').on('click', app.startVideo);
	$('#stopStream').on('click', app.stopVideo);
	$('#startCalib').on('click', app.startCalib);
}

/*
* VIDEO FUNCTIONS
*/
app.startVideo = function() {
	app.video = document.getElementById('vid');

	navigator.getUserMedia(app.videoContraints, function(stream) {
		app.videoShowing = true;
		app.stream = stream;
	  app.video.src = window.URL.createObjectURL(app.stream);
	}, app.errorCallback);
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
	app.calibrationPoint = 0;
	$('#calibInstructions').show();
	$('#overlay').on('click', app.calibClick);
}

app.calibClick = function() {

}

//must go last
$(document).ready(app.main);