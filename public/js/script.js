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
	$('#colorScheme').on('change', app.refreshHeatMap);
	$('#showDartboard').on('change', app.refreshHeatMap);
	$('#showNumbers').on('change', app.refreshHeatMap);
	
	$('#stdDevX, #stdDevY').on('change', function() {
		app.sd = app.getStdDev();
		$('.stdDevXDisp').html(app.sd.x);
		$('.stdDevYDisp').html(app.sd.y);
		if($('#updateWithSlider').is(':checked')) app.refreshHeatMap();
	});
	//standard request to reload heatmap using sliders as inputs
	$('#reload').on("click", function(e) {
		e.preventDefault();
		app.useFilePath = false;
		app.refreshHeatMap();
		return false;
	});
	$('#reloadFromFile').on('click', function(e) {
		e.preventDefault();
		app.useFilePath = true;
		app.refreshHeatMap();
		return false;
	})
}

app.getStdDev = function() {
	var x = parseFloat($('#stdDevX').val()).toFixed(1);
	var y = parseFloat($('#stdDevY').val()).toFixed(1);

	if(x<100) x = '0' + x;
	if(x<10) x = '0' + x;
	if(y<100) y = '0' + y;
	if(y<10) y = '0' + y;

	return {
		'x': x,
		'y': y
	};
}


app.initialiseCanvases = function() {
	app.hmCanvas = document.getElementById('heatmap');
	app.hmCtx = app.hmCanvas.getContext('2d');
	app.ovCanvas = document.getElementById('overlay');
	app.ovCtx = app.hmCanvas.getContext('2d');
}

app.refreshHeatMap = function() {
	//app.colorScheme = ( $('#colorScheme').is(':checked') ? 'color' : 'bw')
	app.colorScheme = $('#colorScheme').val(); 
	switch(app.colorScheme) {
		case 'bw':
			app.color = app.greyScale;
			break;
		case 'whitehot':
			app.color = app.whiteHot;
			break;
		case 'neonblue':
			app.color = app.neonBlue;
			break;
		case 'color':
		default:
			app.color = app.fullColor;
			break;
	}
	app.showDartboard = ( $('#showDartboard').is(':checked') ? true : false);
	app.showNumbers = ( $('#showNumbers').is(':checked') ? true : false);
	//set app.sd
	app.sd = false;
	if(app.firstDraw && app.URLparams) {
		//app.sd = app.acc2sd(app.URLparams.acc);
		app.sd = app.URLparams;
		$('#stdDevX').val(app.sd.x);
		$('#stdDevY').val(app.sd.y);
		//remember we did this
		app.firstDraw = !app.firstDraw;
	}
	//make url
	//if($('#filePath').val().length) {
	if(app.useFilePath) {
		url = $('#filePath').val();
	} else {
		app.sd = app.getStdDev();
		var url = 'heatmaps/' + 'sdx-' + app.sd.x + '-sdy-' + app.sd.y + '.json';
	}
	//display standard deviation
	$('.stdDevXDisp').html(app.sd.x);
	$('.stdDevYDisp').html(app.sd.y);
	//check if this mesh is already saved
	
	if(app.meshs[app.sd.x] && app.meshs[app.sd.x][app.sd.y] && !app.useFilePath) {
		app.processData(app.meshs[app.sd.x][app.sd.y]);
	}
	
	//else make the call
	else {
		url = app.dataLocation + url;
		$.ajax({
			url: url,
			cache: false
		})
		.done(function(data) {
			app.meshs[app.sd.x] = {};
			app.meshs[app.sd.x][app.sd.y] = data;
			app.processData(data);
		})
		.fail(function() {
			app.failedAJAX(url)
		})
	}
}

app.processData = function(data) {
	app.data = data;
	//set pixel size
	app.pixelSize = app.hm.width/app.data.length;
	//find max value of array
	app.data.max = 0;
	app.data.forEach(function(arr) {
		arr.forEach(function(el) {
			el > app.data.max ? app.data.max = el : null;
		})
	});
	$('#maxValue').html(app.data.max.toFixed(6));
	//find coordinates of the maximum point
	var coordsMax = stats.maxXY(app.data);
	//draw
	app.generateHeatmap();
	app.generateLegend();
	app.plotMaxPoint(coordsMax);
	if(app.showDartboard) draw.dartBoard(app.ovCtx, app.ovCanvas, app.hm, app.showNumbers, true);
}

app.failedAJAX = function(url) {
	$('#failedAJAX #badURL').html(url);
	$('#failedAJAX').modal('show');
	$('#generateHeatmapData').show();

	//only generate the heatmap on the backend if the client says so
	$('#generateHeatmapData').on('click', function() {
		$('#generateHeatmapData').hide();
		$('.working').show();
		var settings = {
			'url': 'api/makeHeatmap',
			'type': 'post',
			'data': app.sd
		}
		//make the call!
		$.ajax(settings).done(function(data) {
			$('#failedAJAX').modal('hide');
			$('.working').hide();
			app.processData(data);
		});
	});
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
  return {
  	'x': query_string.sdx,
  	'y': query_string.sdy,
  };
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

app.plotMaxPoint = function(c) {
	app.hmCtx.beginPath();
	var x = {l: app.pixelSize*c.x - 4, r: app.pixelSize*c.x + 4};
	var y = {l: app.pixelSize*c.y - 4, r: app.pixelSize*c.y + 4};
	//draw the cross
	app.hmCtx.moveTo(x.l, y.r);
	app.hmCtx.lineTo(x.r, y.l);
	app.hmCtx.moveTo(x.l, y.l);
	app.hmCtx.lineTo(x.r, y.r);
	app.hmCtx.stroke();
	app.hmCtx.closePath();
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
	app.hmCtx.rect(x-app.pixelSize/2, y-app.pixelSize/2, size, size);
  app.hmCtx.fillStyle = app.color(val/app.data.max);
  app.hmCtx.fill();
  // app.hmCtx.lineWidth = 0;
  // app.hmCtx.strokeStyle = 'black';
  // app.hmCtx.stroke();
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

//
app.whiteHot = function(val) {
	var c = Math.floor(3*255*val);
	var r = 0, g = 0, b = 0;
	while(c > 0) {
		if(b==0 && r!=255)		r++;	//rgb(255,255,255)		-> rgb(255,255,0)
		if(r==255 && g!=255)	g++;		//rgb(255,255,0)				-> rgb(255,0,0)
		if(g==255 && b!=255) 	b++;		//rgb(255,255,0)				-> rgb(0,0,0)
		c--;
	}
	var color = 'rgba('+r+','+g+','+b+',1)';
	//var color = 'rgba('+88+','+shade+','+shade+',1)';
	return color;
}

app.neonBlue = function(val) {
	var c = Math.floor(3*255*val);
	var r = 0, g = 0, b = 0;
	while(c > 0) {
		if(g==0 && b!=255)		b++;	//rgb(255,255,255)		-> rgb(255,255,0)
		if(b==255 && g!=255)	g++;		//rgb(255,255,0)				-> rgb(255,0,0)
		if(g==255 && b==0)		r++;		//rgb(255,255,0)				-> rgb(0,0,0)
		c--;
	}
	var color = 'rgba('+r+','+g+','+b+',1)';
	//var color = 'rgba('+88+','+shade+','+shade+',1)';
	return color;
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