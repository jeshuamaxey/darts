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
		var x = data[0].coords.x*plots.pixelSize;
		var y = data[0].coords.y*plots.pixelSize;

		plots.dbCtx.beginPath()
		plots.dbCtx.moveTo(x, y);
		
		data.forEach(function(el) {
			x = el.coords.x*plots.pixelSize;
			y = el.coords.y*plots.pixelSize;
			/*
			* these currently don't plot both at the same time
			* comment out line 51 to see line
			*/
			//draw.circle(plots.dbCtx, x, y, .5);
			plots.dbCtx.lineTo(x, y);
		});
		
		plots.dbCtx.strokeStyle = '#000';
		plots.dbCtx.closePath();
		plots.dbCtx.stroke();
	});
}


//
$(document).ready(plots.main);