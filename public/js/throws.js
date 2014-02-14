window.q = require('./quotes.js');

var app = app || {};

app.main = function() {
	console.log(99)
	app.loadFileList();
	$('#quoteText').html(q.randomQuote());
}

app.loadFileList = function() {
	var url = 'api/getFileList'
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
	var url = 'data/throw-data/' + $(this).attr('url');
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
		$('#sampleSize').html(data.raw.throws.length)
	})
}

//must go last
$(document).ready(app.main);