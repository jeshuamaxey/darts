(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
* All private variables and functions are attached to the priv object
* which is not exported
*/

var priv = priv || {};

//stores previously calculated values of the factorial function
priv.f = [];

//stores previously calculated values of returnStdDev
priv.rSD = [1000];
// priv.rSD[0] = 1000 and represents the standard deviation for 0% of darts in bull.

/*
* All public variables and functions are attached to the stats object
* which is exported at the end of the module
*/
var stats = stats || {};
/*
* Returns the value of a 1D Gaussian PDF, centerd at meanX
* and standard deviation sdX, at x. When only x is
* provided as an argument it defaults to a normal distribution 
*/
stats.gaussian1D = function(x, meanX, sdX) {
	var meanX = meanX || 0;
	var sdX = sdX || 1;
	var varX = sdX*sdX;

  var m = sdX * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - meanX, 2) / (2 * varX));
  return e / m;
}

/*
* Returns the value of a 2D Gaussian PDF, centerd at (meanX,meanY)
* and standard deviations sdX & sdY, at (x,y). When only x & y are
* provided as arguments it defaults to a normal distribution 
*/

// This gaussian2D function is being updated to be a bivariate Gaussian
// If it receives no correlation number then it is defaulted to zero and
// remains a normal uncorrelated Gaussian
stats.gaussian2D = function(x, y, meanX, meanY, sdX, sdY, corr) {
	var meanX = meanX || 0;
	var meanY = meanY || 0;
	var sdX = sdX || 1;
	var sdY = sdY || 1;
	var corr = corr || 0;
	var varX = sdX*sdX;
	var varY = sdY*sdY;
	//check the normalisation constant
	// The setting of these variables makes sense if you visit http://mathworld.wolfram.com/BivariateNormalDistribution.html
	var expX = Math.pow( (x-meanX)/sdX , 2);
	var expY = Math.pow( (y-meanY)/sdY , 2);
	var expcorr = 2*corr*(x-meanX)*(y-meanY)/(sdX*sdY);
	var z = expX - expcorr + expY;
  	var e = Math.exp(-z/(2*(1-corr*corr)));
  	var m = sdX * sdY * 2 * Math.PI * Math.sqrt(1-(corr*corr));
  	return ( (e / m) < 0.00000001 ? 0 : e/m );
}



// Currently going to have accuracy as a fraction rather than a percentage
stats.calcStandardDev = function(accuracy) {
	return config.meshSize*config.meshRatio.bullseye/0.4;
}

/*
* Returns th value of the error function, accurate to 9 decimal places
*/
stats.erf = function(x) {
	var k=0, el=0, sum=0;
	do {
		el = ( Math.pow(-1,k) / ( (2*k +1)*stats.factorial(k) ) ) * Math.pow(x, (2*k)+1);
		sum += el;
		k++;
	} while(Math.abs(el) > 0.000000001)
	var ans = ((2*sum/Math.sqrt(Math.PI))).toFixed(9);
	return (ans == 'NaN' ? 1 : ans);
}

stats.factorial = function(n) {
  if (n == 1 || n == 0)
    return 1;
  if (priv.f[n] > 0)
    return priv.f[n];
  return priv.f[n] = stats.factorial(n-1) * n;
}

/*
* returns the mean value of an array
*/
stats.mean = function(arr) {
	var N = arr.length;
	var total = 0;
	for (var i = arr.length - 1; i >= 0; i--) {
		total += arr[i];
	};
	return total/N;
}

/*
* returns the standard deviation of an array
*/
stats.stdDev = function(arr, mean) {
	var N = arr.length;
	//if mean is not provided as an arg, calculate it
	var mean = mean || stats.mean(arr);
	var variance = 0;
	for (var i = arr.length - 1; i >= 0; i--) {
		variance += Math.pow((arr[i] - mean), 2);
	};
	return Math.sqrt(variance/(N-1));
}

// erf(n divided by root 2) = fraction of darts thrown contained within the n sigma
// interval.
// For a given percentage of darts within the bull, n values are trialled in the error
// function until one falls within an error bound of the percentage we want.
stats.returnStdDev = function(percentage) {
	trialn = 1; // erf(0) is not defined.
	percentage = Math.round(percentage*2)/2;
	if (priv.rSD[percentage*2] > 0) {
		return priv.rSD[percentage*2];
	}
	for (var i = 1; i <= percentage*2; i++) {
		var resultaccuracy = 0;
		do {
			resultaccuracy = stats.erf((trialn/1000)*Math.pow(2, -0.5));
			trialn += 1;
		}
		while (resultaccuracy < ((i/200) - 0.0005) || resultaccuracy > ((i/200) +0.0005))
	}
	return priv.rSD[percentage*2] = 1/((trialn/1000)-0.001);
}

/*
* returns the x and y coords of the largest value in a 2d array
*/
stats.maxXY = function(arr) {
  var max = 0;
	var c = {'x': 0,'y': 0};
  //begin search
  for(x=0;x<arr.length;x++) {
  	for(y=0;y<arr.length;y++) {
      	if(arr[x][y] > max) {
          max = arr[x][y]; 
        	c.x = x;
          c.y = y;
    		}
  	}
	}
	return c;
}

stats.correlation = function(twoDData, meanX, meanY, sdX, sdY) {
	//function takes an array called
	var sum = 0;
	for (var i=0; i < twoDData.length; i++) {
		sum += (twoDData[i]["mmX"]*twoDData[i]["mmY"]);
	}
	sum = sum/twoDData.length;
	return (sum - meanX*meanY)/(sdX*sdY);
}

// A little bit of a test for the correlation function
// This data here is the data from this video: http://www.videojug.com/film/how-to-calculate-correlation
// And was used for testing the correlation function
/*
someData = [
	{
		"mmX":1,
		"mmY":5
	},
	{
		"mmX":2,
		"mmY":4
	},
	{
		"mmX":3,
		"mmY":5
	},
	{
		"mmX":4,
		"mmY":6
	},
	{
		"mmX":5,
		"mmY":8
	},
	{
		"mmX":6,
		"mmY":9
	},
	{
		"mmX":7,
		"mmY":10
	},
	{
		"mmX":8,
		"mmY":13
	},
	{
		"mmX":9,
		"mmY":12
	},
]
*/

module.exports = stats;
},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{"../../modules/stats.js":1,"./draw.js":2}]},{},[3])