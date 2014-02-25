window.draw = require('./draw.js');
window.q = require('./quotes.js');

var app = app || {};
window.app = app;

//useful string function
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

//set the correct data location URL
app.dataLocation = '';
if (document.location.hostname == "localhost") {
	app.dataLocation = "data/";
} else {
	app.dataLocation = "http://jeshuamaxey.com/misc/data/darts-data/";
}

//determines the directory that is listed in the left hand panel
app.dataSubDir = 'data/throw-data/';

app.main = function() {
	//display list of available files
	app.loadFileList();
	//init canvases
	app.dbCanvas = document.getElementById('dartboard');
	app.dbCtx = app.dbCanvas.getContext('2d');
	app.dbDim = {
		"width" : $('#dartboard').width(),
		"height" : $('#dartboard').height()
	};
	//add a random Sid Waddell quote
	$('#quoteText').html(q.randomQuote());
}

app.loadFileList = function() {
	var url = app.dataLocation + 'data-files.json'; //'api/getFileList';
	$.ajax({
		url: url,
		cache: false
	})
	.done(app.displayFileList)
	.fail(function() {
		app.failedAJAX();
	})
}

app.displayFileList = function(data) {
	data.list.forEach(function(filePath){
		if(filePath.startsWith(app.dataSubDir)) {
			fileName = filePath.substring(app.dataSubDir.length);
			if(fileName != '.DS_Store') {
				$('#fileList').append('<a href="#" class="list-group-item" url=' + fileName + '>'+ fileName +'</a>');
			}
		}
	});
	$('#fileList .list-group-item').on('click', app.switchData)
}

app.switchData = function() {
	$('.list-group-item').removeClass('active');
	$(this).addClass('active');
	var url = 'throw-data/' + $(this).attr('url');
	url = app.dataLocation + url;
	//make the call
	$.ajax({
		url: url,
		cache: false
	}).done(function(data){
		$('#name').html(data.meta.name);
		//table
		$('#stdDevX').html(parseFloat(data.preprocessed.mmX.stdDev).toFixed(3) + 'mm');
		$('#meanX').html(parseFloat(data.preprocessed.mmX.mean).toFixed(3) + 'mm');
		$('#stdDevY').html(parseFloat(data.preprocessed.mmY.stdDev).toFixed(3) + 'mm');
		$('#meanY').html(parseFloat(data.preprocessed.mmY.mean).toFixed(3) + 'mm');
		$('#stdDevR').html(parseFloat(data.preprocessed.mmR.stdDev).toFixed(3) + 'mm');
		$('#meanR').html(parseFloat(data.preprocessed.mmR.mean).toFixed(3) + 'mm');
		//
		$('#sampleSize').html(data.raw.throws.length);
		//add appropriate url to button link
		var sd = Math.round(data.preprocessed.mmR.stdDev*2)/2;
		$('#goToHeatmap').attr('href', '/?sd='+sd).removeClass('disabled');
		//
		app.refreshDartBoard(data);
	});
}

app.refreshDartBoard = function(data) {
	//
	draw.clear(app.dbCtx, app.dbCanvas);
	//
	var x,y,r = 1;
	var mm2px = app.dbDim.width/340;
	
	//add mean point w/ std dev
	//centre coords
	x = app.dbDim.width/2 + data.preprocessed.mmX.mean*mm2px;
	y = data.preprocessed.mmY.mean*mm2px - app.dbDim.height/2;
	//crosshair coords
	//horizontal
	startX = x - data.preprocessed.mmX.stdDev*mm2px
	endX = x + data.preprocessed.mmX.stdDev*mm2px
	//vertical
	startY = y - data.preprocessed.mmY.stdDev*mm2px
	endY = y + data.preprocessed.mmY.stdDev*mm2px
	//define lines
	app.dbCtx.moveTo(startX, y);
	app.dbCtx.lineTo(endX, y);
	app.dbCtx.moveTo(x, startY);
	app.dbCtx.lineTo(x, endY);
	//draw
	app.dbCtx.strokeStyle = '#006600';
	app.dbCtx.lineWidth = 2;
	app.dbCtx.stroke();

	//plot data points
	app.dbCtx.strokeStyle = '#ff0000';
	//draw each point
	data.raw.throws.forEach(function(thrw, i) {
		x = app.dbDim.width/2 + thrw.mmX*mm2px;
		y = app.dbDim.height/2 - thrw.mmY*mm2px;
		console.log(app.dbCtx.strokeStyle);
		draw.circle(app.dbCtx, x, y, r);
	});

	//add wire frame
	app.dbCtx.strokeStyle = '#000000';
	app.dbCtx.lineWidth = 1;
	draw.dartBoard(app.dbCtx, app.dbCanvas, app.dbDim, true, false)
}

app.failedAJAX = function(url) {
	alert('bad ajax');
	// $('#failedAJAX #badURL').html(url)
	// $('#failedAJAX').modal('show');
}

//must go last
$(document).ready(app.main);