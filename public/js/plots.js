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

	plots.db = {
		"width" : $('#dartboard').width(),
		"height" : $('#dartboard').height()
	};
	
	//200 was the mesh size used for the heatmaps which the max-expected data was taken from
	plots.pixelSize = plots.db.width/200;

	//initialise canvases
	plots.dbCanvas = document.getElementById('dartboard');
	plots.dbCtx = plots.dbCanvas.getContext('2d');
	plots.ovCanvas = document.getElementById('overlay');
	plots.ovCtx = plots.ovCanvas.getContext('2d');

	//draw plots
	plots.plotDartboard();
	plots.plotLineGraph();

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

//
plots.plotDartboard = function() {
	//draw a dartboard onto the canvas
	draw.dartBoard(plots.dbCtx, plots.dbCanvas, plots.db, true, true);

	//fetch the max expected data
	url = plots.dataLocation + 'max-expected.json';
	$.ajax({
		url: url,
		cache: false
	})
	//
	.done(function(data) {
		plots.data = data;

		var x = data[0].coords.x*plots.pixelSize;
		var y = data[0].coords.y*plots.pixelSize;
		var old = {'x':0, 'y':0};
		
		//draw points
		data.forEach(function(el) {
			x = el.coords.x*plots.pixelSize;
			y = el.coords.y*plots.pixelSize;
			draw.circle(plots.dbCtx, x, y, .5);
		});

		//draw line
		plots.dbCtx.beginPath()
		plots.dbCtx.moveTo(x, y);

		data.forEach(function(el, i) {
			old.x = x;
			old.y = y;
			x = el.coords.x*plots.pixelSize;
			y = el.coords.y*plots.pixelSize;
			//calc difference between points
			dx = Math.abs(old.x - x);
			dy = Math.abs(old.y - y);
			diff = Math.pow(dx*dx + dy*dy, 0.5);
			if(diff>5*plots.pixelSize) plots.dbCtx.moveTo(x, y);
			else plots.dbCtx.lineTo(x, y);
		});
		
		plots.dbCtx.strokeStyle = '#000';
		plots.dbCtx.closePath();
		plots.dbCtx.stroke();
	});
}

//
plots.updateOverlay = function() {
	//clear canvas
	draw.clear(plots.ovCtx, plots.ovCanvas);
	//get all the info we need
	var sd = parseFloat($(this).val());
	var i = sd/0.5 - 1;
	var x = plots.data[i].coords.x*plots.pixelSize;
	var y = plots.data[i].coords.y*plots.pixelSize;
	var maxExp = plots.data[i].max;
	//update displays
	$('.stdDevDisp').html(sd.toFixed(1));
	$('.maxExpDisp').html(maxExp.toFixed(2));
	//update canvas
	plots.ovCtx.strokeStyle = '#f00';
	draw.circle(plots.ovCtx, x, y, 2);
	plots.ovCtx.strokeStyle = '#fff'
}

//
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

	  console.log(data)

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

//
$(document).ready(plots.main);