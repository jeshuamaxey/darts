(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var draw = draw || {};

/*
* Takes three arguments:
* context: the canvas context used to draw
* canvas: the canvas element that pertains to the context
* dim: a dimensions object of the form {height: 100, width: 100}
*/

draw.dartBoard = function(context, canvas, dim) {
	//set metrics
	var db = {};
	db.x = dim.width/2; // db.x is the central x coordinate.
	db.y = dim.height/2; // db.y is the central y coordinate.
	db.rad = dim.width/2;
	
	//treble ring
	draw.circle(context, db.x, db.y, db.rad*99/200);
	draw.circle(context, db.x, db.y, db.rad*107/200);
	//double ring
	draw.circle(context, db.x, db.y, db.rad*170/200);
	draw.circle(context, db.x, db.y, db.rad*162/200);
	//bull
	draw.circle(context, db.x, db.y, db.rad*6.35/200);
  draw.circle(context, db.x, db.y, db.rad*15.9/200);

	var theta, innerX, innerY, outerX, outerY;

	for (var i = 0; i < 20; i++) {
		//Math.PI not Math.Pi
		theta = Math.PI/20 + i*(Math.PI/10);
		innerX = Math.round((db.rad*15.9/200) * Math.cos(theta) + db.x);
		innerY = Math.round(db.y - ((db.rad*15.9/200) * Math.sin(theta)));
		outerX = Math.round(((db.rad*170/200) * Math.cos(theta)) + db.x);
		outerY = Math.round(db.y - ((db.rad*170/200) * Math.sin(theta)));
		
  	context.beginPath();
    context.moveTo(innerX, innerY);
  	context.lineTo(outerX, outerY);
    context.stroke();
  }
}

/*
*
*/
draw.circle = function(ctx, x, y, rad) {
	ctx.beginPath();
	ctx.arc(x, y, rad, 0, Math.PI*2, true);
	ctx.stroke();
	ctx.closePath();
}

module.exports = draw;
},{}],2:[function(require,module,exports){
window.draw = require('./draw.js');
window.q = require('./quotes.js');

var app = app || {};

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
		$('#sampleSize').html(data.raw.throws.length);
		//
		app.refreshDartBoard(data);
	});
}

app.refreshDartBoard = function(data) {
	draw.dartBoard(app.dbCtx, app.dbCanvas, app.dbDim)
}

//must go last
$(document).ready(app.main);
},{"./draw.js":1,"./quotes.js":3}],3:[function(require,module,exports){
var q = q || {};

q.quotes = ["There's only one word for that: magic darts!","William Tell could take an apple off your head, Taylor could take out a processed pea.","The players are under so much duress, it's like duressic park out there!","The atmosphere is so tense, if Elvis walked in ,with a portion of chips……. you could hear the vinegar sizzle on them.","When Alexander of Macedonia was 33, he cried salt tears because there were no more worlds to conquer..... Bristow's only 27.","Phil Taylor's got the consistency of a planet ... and he's in a darts orbit!","That was like throwing three pickled onions into a thimble!","There hasn't been this much excitement since the Romans fed the Christians to the Lions.","It's like Dracula getting out of his grave and asking for a few chips with his steak.","This game of darts is twisting like a rattlesnake with a hernia!","Keith Deller's not just an underdog, he's an underpuppy!","This lad has more checkouts than Tescos.","Big Cliff Lazarenko's idea of exercise is sitting in a room with the windows open taking the lid off something cool and fizzy.","Jockey Wilson, he comes from the valleys and he's chuffing like a choo-choo train!","I don't know what he's had for breakfast but Taylor knocked the Snap, Crackle and Pop outta Bristow.","He looks about as happy as a penguin in a microwave.","Steve Beaton - The adonis of darts, what poise, what elegance - a true Roman gladiator with plenty of hair wax.","They won't just have to play outta their skin to beat Phil Taylor. They'll have to play outta their essence!","Steve Beaton, he's not Adonis, he's THE donis","If we'd had Phil Taylor at Hastings against the Normans, they'd have gone home.","Look at the man go, its like trying to stop a waterbuffalo with a pea-shooter.","Bristow reasons... Bristow quickens... Aaah, Bristow."];

q.randomQuote = function() {
	var i = Math.floor(Math.random()*q.quotes.length);
	return q.quotes[i];
}

module.exports = q;
},{}]},{},[2])