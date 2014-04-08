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

var plots = plots || {};
window.plots = plots;

//set the correct data location URL
plots.dataLocation = '';
if (document.location.hostname == "localhost") {
	plots.dataLocation = "data/";
} else {
	plots.dataLocation = "http://jeshuamaxey.com/misc/data/darts-data/";
}

//run on page load
plots.main = function() {
	$('#stdDev').on('change', plots.updateOverlay);
	$('#plotIntervals').on('click', function() {
		plots.showMultipleSds($('#interval').val())
	});

	plots.db = {
		"width" : $('.dartboard').width(),
		"height" : $('.dartboard').height()
	};
	
	//200 was the mesh size used for the heatmaps which the max-expected data was taken from
	plots.pixelSize = plots.db.width/200;

	//initialise canvases
	plots.sdDbCanvas = document.getElementById('sdDartboard');
	plots.sdDbCtx = plots.sdDbCanvas.getContext('2d');
	plots.sdOverlayCanvas = document.getElementById('sdOverlay');
	plots.sdOverlayCtx = plots.sdOverlayCanvas.getContext('2d');
	plots.sdOverlayCtx.strokeStyle = '#f00';

	plots.corDbCanvas = document.getElementById('corDartboard');
	plots.corDbCtx = plots.corDbCanvas.getContext('2d');
	plots.corOverlayCanvas = document.getElementById('corOverlay');
	plots.corOverlayCtx = plots.corOverlayCanvas.getContext('2d');

	//draw plots
	plots.plotAimVsSdDb();
	plots.plotLineGraph();
	plots.plotAimVsCorDb();

	//setup event listeners
	$('.panel-collapse').on('hide.bs.collapse', function () {
		var id = $(this).data('plot-id');
		$('#'+id).hide();
	});
	$('.panel-collapse').on('show.bs.collapse', function () {
		var id = $(this).data('plot-id');
		$('#'+id).show();
	});
}

/*
* generates the plot of optimum aim as a function of sd
*/
plots.plotAimVsSdDb = function() {
	//draw a dartboard onto the canvas
	draw.dartBoard(plots.sdDbCtx, plots.sdDbCanvas, plots.db, true, true);

	//fetch the max expected data
	url = plots.dataLocation + 'max-expected.json';
	$.ajax({
		url: url,
		cache: false
	})
	//
	.done(function(data) {
		plots.sdData = data;

		var x = plots.sdData[0].coords.x*plots.pixelSize;
		var y = plots.sdData[0].coords.y*plots.pixelSize;
		var old = {'x':0, 'y':0};

		draw.circle(plots.sdOverlayCtx, x, y, 2);
		
		//draw points
		plots.sdData.forEach(function(point) {
			x = point.coords.x*plots.pixelSize;
			y = point.coords.y*plots.pixelSize;
			draw.circle(plots.sdDbCtx, x, y, .5);
		});

		//draw line
		plots.sdDbCtx.beginPath()
		plots.sdDbCtx.moveTo(x, y);

		plots.sdData.forEach(function(point, i) {
			old.x = x;
			old.y = y;

			x = point.coords.x*plots.pixelSize;
			y = point.coords.y*plots.pixelSize;
			//calc difference between points
			dx = Math.abs(old.x - x);
			dy = Math.abs(old.y - y);
			diff = Math.pow(dx*dx + dy*dy, 0.5);
			if(diff>5*plots.pixelSize) plots.sdDbCtx.moveTo(x, y);
			else plots.sdDbCtx.lineTo(x, y);
		});
		
		plots.sdDbCtx.strokeStyle = '#000';
		plots.sdDbCtx.stroke();
	});
}

/*
*
*/
plots.updateOverlay = function() {
	//clear canvas
	draw.clear(plots.sdOverlayCtx, plots.sdOverlayCanvas);
	//get all the info we need
	var sd = parseFloat($(this).val());
	var i = sd/0.5 - 1;
	var x = plots.sdData[i].coords.x*plots.pixelSize;
	var y = plots.sdData[i].coords.y*plots.pixelSize;
	var maxExp = plots.sdData[i].max;
	//update displays
	$('#stdDbDevDisp').html(sd.toFixed(1));
	$('.maxExpDisp').html(maxExp.toFixed(2));
	//update canvas
	plots.sdOverlayCtx.strokeStyle = '#f00';
	draw.circle(plots.sdOverlayCtx, x, y, 2);
}

/*
*
*/
plots.showMultipleSds = function(interval) {
	//clear canvas
	draw.clear(plots.sdOverlayCtx, plots.sdOverlayCanvas);
	//default to showing every 10 data points
	var interval = interval || 10;
	//plot the circles
	plots.sdData.forEach(function(el, i){
  if(i%interval == 0) {
	    plots.sdOverlayCtx.strokeStyle = '#f00';
			draw.circle(plots.sdOverlayCtx,
									el.coords.x*plots.pixelSize,
									el.coords.y*plots.pixelSize, 2);
	  }
	})
}

/*
* generates the plot of max expected vs sd
*/
plots.plotLineGraph = function() {
	var margin = {top: 80, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

	var x = d3.scale.linear()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
	    .x(function(d) { return x(d.sd); })
	    .y(function(d) { return y(d.max); });

	var svg = d3.select("#lineGraphWrapper").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.csv(plots.dataLocation+"max-expected.csv", function(error, data) {
	  data.forEach(function(d) {
	    d.sd = +d.sd;
	    d.max = +d.max;
	  });

	  x.domain(d3.extent(data, function(d) { return d.sd; }));
	  y.domain(d3.extent(data, function(d) { return d.max; }));

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Maximum expected score per dart");

	  svg.append("path")
	      .datum(data)
	      .attr("class", "line")
	      .attr("d", line);
	});
}

/*
* generates the plot of optimum aim as a function of
* correlation for different standard deviations
*/
plots.plotAimVsCorDb = function() {
	//draw a dartboard onto the canvas
	draw.dartBoard(plots.corDbCtx, plots.corDbCanvas, plots.db, true, true);

	//fetch the max expected data
	url = plots.dataLocation + 'max-vs-cor.json';
	$.ajax({
		url: url,
		cache: false
	})
	//
	.done(function(data) {
		plots.corData = data;
		//plotCovSeries(plots.corData[1])
		plots.corData.forEach(plotCovSeries)
	});
}

/*
* plot a single series of covariance data
*/
function plotCovSeries(series, i, arr) {

	var index = (i+1)/(arr.length+1);
	//console.log(i+1 + '/'+ (arr.length+1) + '=' + index)
	var colour = plots.fullColor(index)

	//console.log(series)
	var x = series.data[0].coords.x*plots.pixelSize;
	var y = series.data[0].coords.y*plots.pixelSize;
	var old = {'x':0, 'y':0};

	series.data.forEach(function(point) {
		//draw points
		x = point.coords.x*plots.pixelSize;
		y = point.coords.y*plots.pixelSize;
		draw.circle(plots.corDbCtx, x, y, .5);
	});

	//draw line
	plots.corDbCtx.beginPath()
	plots.corDbCtx.moveTo(x, y);

	series.data.forEach(function(point, i) {
		old.x = x;
		old.y = y;
		x = point.coords.x*plots.pixelSize;
		y = point.coords.y*plots.pixelSize;
		//calc difference between points
		// dx = Math.abs(old.x - x);
		// dy = Math.abs(old.y - y);
		// diff = Math.pow(dx*dx + dy*dy, 0.5);
		// if(diff>5*plots.pixelSize) plots.corDbCtx.moveTo(x, y);
		// else plots.corDbCtx.lineTo(x, y);
		plots.corDbCtx.lineTo(x, y);
	});

	plots.corDbCtx.strokeStyle = colour;
	plots.corDbCtx.stroke();
	
}

//takes a value in the range 0-1
plots.fullColor = function(val) {
	var c = Math.floor(5*255*val);
	var r = 255, g = 255, b = 255;
	while(c > 0) {
		if(r!=0 	&& g==255 && b==255)		r--;	//rgb(255,255,255)		-> rgb(0,255,255)
		if(r==0 	&& g==255 && b!=0) 		b--;		//rgb(0,255,0)				-> rgb(0,255,0)
		if(r!=255 && g==255 && b==0) 		r++;		//rgb(0,255,0)				-> rgb(255,255,0)
		if(r==255 && g!=0 	&& b==0) 		g--;		//rgb(255,255,0)			-> rgb(255,0,	0)
		if(r==255 && g==0 	&& b!=255)	b++;		//rgb(255,0,0)				-> rgb(255,0,255)
		c--;
	}
	var color = 'rgba('+r+','+g+','+b+',1)';
	//var color = 'rgba('+88+','+shade+','+shade+',1)';
	return color;
}

//
$(document).ready(plots.main);
},{"./draw.js":1}]},{},[2])