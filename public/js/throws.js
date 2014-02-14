window.draw = require('./draw.js');
window.q = require('./quotes.js');

var app = app || {};
window.app = app;

//set the correct data location URL
app.dataLocation = '';
if (document.location.hostname == "localhost") {
	app.dataLocation = "data/";
} else {
	app.dataLocation = "http://jeshuamaxey.com/misc/data/darts-data/";
}

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
	var url = 'api/getFileList';
	$.ajax({
		url: url,
		cache: false
	})
	.done(app.displayFileList)
	.fail(function() {
		//app.failedAJAX()
	})
}

app.displayFileList = function(list) {
	list.forEach(function(file){
		$('#fileList').append('<a href="#" class="list-group-item" url=' + file + '>'+ file +'</a>')
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
	//plot data points
	app.dbCtx.strokeStyle = '#ff0000';
	var x,y,r = 3;
	var mm2px = app.dbDim.width/340;
	//draw each point
	data.raw.throws.forEach(function(thrw) {
		x = app.dbDim.width/2 + thrw.mmX*mm2px;
		y = app.dbDim.height/2 + thrw.mmY*mm2px;
		draw.circle(app.dbCtx, x, y, r)
	})
	//add wire frame
	app.dbCtx.strokeStyle = '#000000'
	draw.dartBoard(app.dbCtx, app.dbCanvas, app.dbDim)
}

//must go last
$(document).ready(app.main);