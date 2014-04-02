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
	$('#stdDev').on('change', plots.updatePlot);

	plots.db = {
		"width" : $('#dartboard').width(),
		"height" : $('#dartboard').height()
	};
	
	//200 was the mesh size used for the heatmaps which the max-expected data was taken from
	plots.pixelSize = plots.db.width/200;

	plots.dbCanvas = document.getElementById('dartboard');
	plots.dbCtx = plots.dbCanvas.getContext('2d');

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
plots.updatePlot = function() {
	var sd = parseFloat($(this).val());
	$('.stdDevDisp').html(sd.toFixed(1));
	var i = sd/0.5 - 1;
	var x = plots.data[i].coords.x*plots.pixelSize;
	var y = plots.data[i].coords.y*plots.pixelSize;
	plots.dbCtx.strokeStyle = '#f00';
	draw.circle(plots.dbCtx, x, y, 2);
	plots.dbCtx.strokeStyle = '#fff'
}

//
$(document).ready(plots.main);