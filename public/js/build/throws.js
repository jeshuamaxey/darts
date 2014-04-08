(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var draw = draw || {};

/*
* Takes five arguments:
* context: the canvas context used to draw
* canvas: the canvas element that pertains to the context
* dim: a dimensions object of the form {height: 100, width: 100}
* displayNumbers: a bool to determine whether to draw bed values on the board
* margin: a bool to determine whether to include a margin when drawing the board
*/

draw.dartBoard = function(context, canvas, dim, displayNumbers, margin) {
	//
	var dartboardnumbers = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];
	context.textAlign = "center"
	context.fillStyle = "#000";
	context.font = dim.width/25 + "px Helvetica";
	//set metrics
	var db = {};
	db.x = dim.width/2; // db.x is the central x coordinate.
	db.y = dim.height/2; // db.y is the central y coordinate.
	db.rad = dim.width/2;
	//determines whether a margin is included in the dartboard drawing
	var scaleFactor = (margin ? 200 : 170);
	
	//treble ring
	draw.circle(context, db.x, db.y, db.rad*99/scaleFactor);
	draw.circle(context, db.x, db.y, db.rad*107/scaleFactor);
	//double ring
	draw.circle(context, db.x, db.y, db.rad*170/scaleFactor);
	draw.circle(context, db.x, db.y, db.rad*162/scaleFactor);
	//bull
	draw.circle(context, db.x, db.y, db.rad*6.35/scaleFactor);
  draw.circle(context, db.x, db.y, db.rad*15.9/scaleFactor);

	var theta, innerX, innerY, outerX, outerY;

	for (var i = 0; i < 20; i++) {
		theta = Math.PI/20 + i*(Math.PI/10);
		innerX = Math.round((db.rad*15.9/scaleFactor) * Math.cos(theta) + db.x);
		innerY = Math.round(db.y - ((db.rad*15.9/scaleFactor) * Math.sin(theta)));
		outerX = Math.round(((db.rad*170/scaleFactor) * Math.cos(theta)) + db.x);
		outerY = Math.round(db.y - ((db.rad*170/scaleFactor) * Math.sin(theta)));
		
		context.beginPath();
    context.moveTo(innerX, innerY);
  	context.lineTo(outerX, outerY);

	  if(displayNumbers) {
	  	theta -= Math.PI/20;
	  	outerX = Math.round(((db.rad*135/scaleFactor) * Math.cos(theta)) + db.x);
			outerY = Math.round(db.y - ((db.rad*135/scaleFactor) * Math.sin(theta)));
	  	context.fillText(dartboardnumbers[i], outerX, outerY);
		}
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

//a handy function to clear the canvas (X-browser friendly)
//http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
// http://jsfiddle.net/jeshuamaxey/YQP82/2/
draw.clear = function(context, canvas) {
	context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
  // context.fillStyle = "rgba(0,0,0,0.0)";
  // context.fillRect(0, 0, canvas.width, canvas.height);
};

module.exports = draw;
},{}],2:[function(require,module,exports){
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
	var url = app.dataLocation + 'data-files.json';
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
	console.log(data)
	data.list.forEach(function(filePath){
		if(filePath.startsWith(app.dataSubDir) && !filePath.startsWith(app.dataSubDir + 'csv')) {
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
		$('#correlation').html(parseFloat(data.preprocessed.correlation).toFixed(3));
		//
		$('#sampleSize').html(data.raw.throws.length);
		//add appropriate url to button link
		var sd = {
			'x': Math.round(data.preprocessed.mmX.stdDev*2)/2,
			'y': Math.round(data.preprocessed.mmY.stdDev*2)/2
		};
		console.log(sd)
		$('#goToHeatmap').attr('href', '/?sdx='+sd.x+'&sdy='+sd.y).removeClass('disabled');
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
},{"./draw.js":1,"./quotes.js":3}],3:[function(require,module,exports){
var q = q || {};

//q.quotes = ["There's only one word for that: magic darts!","William Tell could take an apple off your head, Taylor could take out a processed pea.","The players are under so much duress, it's like duressic park out there!","The atmosphere is so tense, if Elvis walked in ,with a portion of chips……. you could hear the vinegar sizzle on them.","When Alexander of Macedonia was 33, he cried salt tears because there were no more worlds to conquer..... Bristow's only 27.","Phil Taylor's got the consistency of a planet ... and he's in a darts orbit!","That was like throwing three pickled onions into a thimble!","There hasn't been this much excitement since the Romans fed the Christians to the Lions.","It's like Dracula getting out of his grave and asking for a few chips with his steak.","This game of darts is twisting like a rattlesnake with a hernia!","Keith Deller's not just an underdog, he's an underpuppy!","This lad has more checkouts than Tescos.","Big Cliff Lazarenko's idea of exercise is sitting in a room with the windows open taking the lid off something cool and fizzy.","Jockey Wilson, he comes from the valleys and he's chuffing like a choo-choo train!","I don't know what he's had for breakfast but Taylor knocked the Snap, Crackle and Pop outta Bristow.","He looks about as happy as a penguin in a microwave.","Steve Beaton - The adonis of darts, what poise, what elegance - a true Roman gladiator with plenty of hair wax.","They won't just have to play outta their skin to beat Phil Taylor. They'll have to play outta their essence!","Steve Beaton, he's not Adonis, he's THE donis","If we'd had Phil Taylor at Hastings against the Normans, they'd have gone home.","Look at the man go, its like trying to stop a waterbuffalo with a pea-shooter.","Bristow reasons... Bristow quickens... Aaah, Bristow."];"

q.quotes = ["Bristow reasons... Bristow quickens... Aaah, Bristow.","Jockey Wilson... What an athlete.","That was like throwing three pickled onions into a thimble!","He\'s about as predictable as a Wasp on speed","Look at the man go, its like trying to stop a waterbuffalo with a pea-shooter","The atmosphere is so tense, if Elvis walked in with a portion of chips, you could hear the vinegar sizzle on them","Big Cliff Lazarenko\'s idea of exercise is sitting in a room with the windows open taking the lid off something cool and fizzy.","It\'s like trying to pin down a kangaroo on a trampoline","Well as giraffes say, you don\'t get no leaves unless you stick your neck out","His eyes are bulging like the belly of a hungry ch.affinch","That\'s the greatest comeback since Lazarus.","It\'s the nearest thing to public execution this side of Saudi Arabia.","His physiognomy is that of a weeping Madonna.","He\'s as cool as a prized marrow!","Under that heart of stone beat muscles of pure flint.","He looks about as happy as a penguin in a microwave.","The pendulum swinging back and forth like a metronome","His face is sagging with tension.","The fans now, with their eyes pierced on the dart board.","He\'s been burning the midnight oil at both ends.","That\'s like giving Dracula the keys to the blood bank","As they say at the DHSS, we\'re getting the full benefit here.","He is as slick as minestrone soup","There hasn\'t been this much excitement since the Romans fed the Christians to the Lions.","The players are under so much duress, it\'s like duressic park out there!","This lad has more checkouts than Tescos.","John Lowe is striding out like Alexander the Great conquering the Persians","When I see Steve Davis I see two letters... C S... Cue Sorceror","By the time of the final on Sunday he should be fit to burst!","There\'s only one word for that - magic darts!","Keith Deller\'s not just an underdog, he\'s an underpuppy!","I don\'t know what he\'s had for breakfast but Taylor knocked the Snap, Crackle and Pop outta Bristow","Even Hypotenuse would have trouble working out these angles","Steve Beaton - The adonis of darts, what poise, what elegance - a true roman gladiator with plenty of hair wax.","If you\'re round your auntie\'s tonight, tell her to stop making the cookie\'s and come thru to the living room and watch these two amazing athletes beat the proverbial house out of each other","When Alexander of Macedonia was 33, he cried salt tears because there were no more worlds to conquer..... Bristow\'s only 27.","Eat your heart out Harold Pinter, we\'ve got drama with a capital D in Essex.","If we\'d had Phil Taylor at Hastings against the Normans, they\'d have gone home.","He\'s playing out of his pie crust.","They won\'t just have to play outta their skin to beat Phil Taylor. They\'ll have to play outta their essence!","Darts players are probably a lot fitter than most footballers in overall body strength.","There\'s no one quicker than these two tungsten tossers... ","Look at him as he takes his stance, like he has been sculptured, whereas Bobby George is like the Hunchback of Notre Dame.","He\'s playing like Robin Hood in the Nottingham super league","Phil Taylor\'s got the consistency of a planet ... and he\'s in a darts orbit!","The atmosphere is a cross between the Munich Beer Festival and the Coliseum when the Christians were on the menu.","Jockey Wilson, he comes from the valleys and he\'s chuffing like a choo-choo train!","He\'s like D\'Artagnan at the scissor factory.","Steve Beaton, he\'s not Adonis, he\'s THE donis"];

q.randomQuote = function() {
	var i = Math.floor(Math.random()*q.quotes.length);
	return q.quotes[i];
}

module.exports = q;
},{}]},{},[2])