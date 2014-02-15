window.stats = require('../../modules/stats.js');
window.draw = require('./draw.js');

var app = app || {};
window.app = app;

//set the correct data location URL
app.dataLocation = '';
if (document.location.hostname == "localhost") {
	app.dataLocation = "data/";
} else {
	app.dataLocation = "http://jeshuamaxey.com/misc/data/darts-data/";
}

app.pixelSize = 2;

app.meshs = {};
app.firstDraw = true;


app.main = function() {
	app.hm = {
		"width" : $('#heatmap').width(),
		"height" : $('#heatmap').height()
	}

	app.URLparams = app.getURLparams();
	app.initialiseCanvases();
	app.refreshHeatMap();
	$('#canvasWrapper').mousemove(app.updateHoverPixel);
	$('#canvasWrapper').on("click", app.updateFocusPixel);
	$('#colorScheme').on('change', app.refreshHeatMap)
	$('#stdDev').on('change', function() {
		app.sd = parseFloat($('#stdDev').val()).toFixed(1);
		if(app.sd<100) app.sd = '0' + app.sd;
		if(app.sd<10) app.sd = '0' + app.sd;
		$('.stdDevDisp').html(app.sd)
		if($('#updateWithSlider').is(':checked')) app.refreshHeatMap();
	})
	$('#reload').on("click", function(e) {
		e.preventDefault();
		app.refreshHeatMap();
		return false;
	});
}


app.initialiseCanvases = function() {
	app.hmCanvas = document.getElementById('heatmap');
	app.hmCtx = app.hmCanvas.getContext('2d');
	app.ovCanvas = document.getElementById('overlay');
	app.ovCtx = app.hmCanvas.getContext('2d');
}

app.refreshHeatMap = function() {
	app.colorScheme = ( $('#colorScheme').is(':checked') ? 'color' : 'bw')
	//set app.sd
	app.sd = false;
	if(app.firstDraw && app.URLparams.sd) {
		//app.sd = app.acc2sd(app.URLparams.acc);
		app.sd = app.URLparams.sd;
		$('#stdDev').val(app.sd)
		//remember we did this
		app.firstDraw = !app.firstDraw;
	}
	//make url
 if($('#filePath').val().length) {
		url = $('#filePath').val();
	} else {
		app.sd = parseFloat($('#stdDev').val()).toFixed(1);
		if(app.sd<100) app.sd = '0' + app.sd;
		if(app.sd<10) app.sd = '0' + app.sd;
		var url = 'symmetric/' + 'sd-' + app.sd + '.json';
	}
	//display standard deviation
	$('.stdDevDisp').html(app.sd)
	//check if this mesh is already saved
	if(app.meshs[app.sd.toString]) {
		app.processData(app.meshs[app.sd.toString])
	}
	url = app.dataLocation + url;
	//make the call
	{
		$.ajax({
			url: url,
			cache: false
		})
		.done(app.processData)
		.fail(function() {
			app.failedAJAX(url)
		})
	}
}

app.processData = function(data) {
	app.data = data;
	app.data.max = 0;
	app.data.forEach(function(arr) {
		arr.forEach(function(el) {
			el > app.data.max ? app.data.max = el : null;
		})
	});
	app.pixelSize = app.hm.width/app.data.length;
	app.generateHeatmap();
	app.generateLegend();
	draw.dartBoard(app.ovCtx, app.ovCanvas, app.hm);
}

app.failedAJAX = function(url) {
	$('#failedAJAX #badURL').html(url)
	$('#failedAJAX').modal('show');
}

app.getURLparams = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
  return query_string;
}

/*
* All drawing related functions
*/

app.generateLegend = function() {
	app.lgCanvas = document.getElementById('legend');
	app.lgCtx = app.lgCanvas.getContext('2d');
	app.lg = {
		"width" : 250,
		"height" : 40,
		"margin" : 10
	};
	for(c=0;c<app.lg.width;c++) {
		app.lgCtx.beginPath();
		app.lgCtx.rect(c,0,1,app.lg.height);
		app.lgCtx.fillStyle = app.color(c/app.lg.width);
		app.lgCtx.fill();
	}
	$('#pc100').html((app.data.max).toFixed(1))
	$('#pc50').html((app.data.max/2).toFixed(1))
}

app.generateHeatmap = function() {
	app.resizeCanvas(app.data.length);	//assuming app.data is a square for now
	for (var x=0; x < app.data.length; x++) {
		for (var y=0; y < app.data.length; y++) {
			app.plotPixel(x*app.pixelSize, y*app.pixelSize, app.pixelSize, app.data[x][y]);
		};
	};
}

app.updateHoverPixel = function(e) {
	var x = Math.floor(e.offsetX/app.pixelSize);
	var y = Math.floor(e.offsetY/app.pixelSize);
	if(x < app.data.length && y < app.data.length) {
		var val = app.data[x][y];
		$('#hoverPixelValue').html(val.toFixed(4));
		$('#diffPixelValue').html(Math.abs(val - app.focuxPxVal).toFixed(4));
	}
}

app.updateFocusPixel = function(e) {
	app.clearCanvas(app.ovCtx, app.ovCanvas);
	var x = Math.floor(e.offsetX/app.pixelSize);
	var y = Math.floor(e.offsetY/app.pixelSize);
	if(x < app.data.length && y < app.data.length) {
		var val = app.data[x][y];
		//update canvas
		draw.circle(app.ovCtx, (x*app.pixelSize) + app.pixelSize/2, (y*app.pixelSize) + app.pixelSize/2, 5);
		//update info panel
		app.focuxPxVal = val;
		$('#focusPixelValue').html(app.focuxPxVal.toFixed(4));
	}
}

app.resizeCanvas = function() {
	app.hmCanvas.style.width = "px";
	app.hmCanvas.style.height = "px";
}

app.plotPixel = function(x, y, size, val) {
	app.hmCtx.beginPath();
	app.hmCtx.rect(x, y, size, size);
  app.hmCtx.fillStyle = app.color(val/app.data.max);
  app.hmCtx.fill();
  // app.hmCtx.lineWidth = 0;
  // app.hmCtx.strokeStyle = 'black';
  // app.hmCtx.stroke();
}

app.color = function(val) {
	return (app.colorScheme == 'bw') ? app.greyScale(val) : app.fullColor(val);
}

//takes a value in the range 0-1
app.fullColor = function(val) {
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
app.greyScale = function(val) {
	if(val>1){console.log('val: '+val)}
	var shade = (255*(1-val)).toFixed(0);
	return 'rgba('+shade+','+shade+','+shade+',1)';
}

//a handy function to clear the canvas (X-browser friendly)
//http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
//can't get this to work although this jsfiddle does work???
// http://jsfiddle.net/jeshuamaxey/YQP82/2/
app.clearCanvas = function(context, canvas) {
	//context.clearRect(0, 0, canvas.width, canvas.height);
  var w = canvas.width;
  canvas.width = 1;
  canvas.width = w;
  // context.fillStyle = "rgba(0,0,0,0.0)";
  // context.fillRect(0, 0, canvas.width, canvas.height);
};

//must go last
$(document).ready(app.main);