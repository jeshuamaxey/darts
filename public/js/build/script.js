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
* and standard deviations sdX, at x. When only x is
* provided as an argument it defaults to a normal distribution 
*/
stats.gaussian1D = function(x, meanX, sdX) {
	var meanX = meanX || 0;
	var sdX = sdX || 1;
	var varX = sdX*sdX;

  var m = stats.stdDev * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - stats.mean, 2) / (2 * stats.variance));
  return e / m;
}

/*
* Returns the value of a 2D Gaussian PDF, centerd at (meanX,meanY)
* and standard deviations sdX & sdY, at (x,y). When only x & y are
* provided as arguments it defaults to a normal distribution 
*/
stats.gaussian2D = function(x, y, meanX, meanY, sdX, sdY) {
	var meanX = meanX || 0;
	var meanY = meanY || 0;
	var sdX = sdX || 1;
	var sdY = sdY || 1;
	var varX = sdX*sdX;
	var varY = sdY*sdY;
	//check the normalisation constant
  var e = Math.exp( - ( Math.pow(x - meanX, 2) / (2 * varX) + Math.pow(y - meanY, 2) / (2 * varY) ) );
  var m = sdX * sdY * 2 * Math.PI;
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
	var total = 0;
	for (var i = arr.length - 1; i >= 0; i--) {
		total += arr[i];
	};
	return total/arr.length;
}

/*
* returns the standard deviation of an array
*/
stats.stdDev = function(arr, mean) {
	//if mean is not provided as an arg, calculate it
	var mean = mean || stats.mean(arr);
	var variance = 0;
	for (var i = arr.length - 1; i >= 0; i--) {
		variance += Math.pow((arr[i] - mean), 2);
	};
	return Math.sqrt(variance/arr.length);
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

module.exports = stats;
},{}],2:[function(require,module,exports){
var draw = draw || {};

draw.dartBoard = function() {
	//set metrics
	app.db = {};
	app.db.x = app.hm.width/2; // app.db.x is the central x coordinate.
	app.db.y = app.hm.height/2; // app.db.y is the central y coordinate.
	app.db.rad = app.hm.width/2;
	
  	//treble ring
  	app.drawCircle(app.ovCtx, app.db.x, app.db.y, app.db.rad*99/200);
  	app.drawCircle(app.ovCtx, app.db.x, app.db.y, app.db.rad*107/200);
  	//double ring
  	app.drawCircle(app.ovCtx, app.db.x, app.db.y, app.db.rad*170/200);
  	app.drawCircle(app.ovCtx, app.db.x, app.db.y, app.db.rad*162/200);
  	//bull
	app.drawCircle(app.ovCtx, app.db.x, app.db.y, app.db.rad*6.35/200);
  	app.drawCircle(app.ovCtx, app.db.x, app.db.y, app.db.rad*15.9/200);

  	var theta, innerX, innerY, outerX, outerY;
  
  	for (var i = 0; i < 20; i++) {
  		//Math.PI not Math.Pi
  		theta = Math.PI/20 + i*(Math.PI/10);
  		innerX = Math.round((app.db.rad*15.9/200) * Math.cos(theta) + app.db.x);
  		innerY = Math.round(app.db.y - ((app.db.rad*15.9/200) * Math.sin(theta)));
  		outerX = Math.round(((app.db.rad*170/200) * Math.cos(theta)) + app.db.x);
  		outerY = Math.round(app.db.y - ((app.db.rad*170/200) * Math.sin(theta)));
  		
    	app.ovCtx.beginPath();
		app.ovCtx.moveTo(innerX, innerY);
    	app.ovCtx.lineTo(outerX, outerY);
		app.ovCtx.stroke();
    }
}

module.exports = draw;
},{}],3:[function(require,module,exports){
window.stats = require('../../modules/stats.js');


var app = app || {};
window.app = app;

app.pixelSize = 2;

app.draw = require('./draw.js');

console.log(app)

app.hm = {
	"width" : 800,
	"height" : 800,
	"margin" : 0
}

app.meshs = {};
app.firstDraw = true;


app.main = function() {
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
		var url = 'data/symmetric/' + 'sd-' + app.sd + '.json';
	}
	//display standard deviation
	$('.stdDevDisp').html(app.sd)
	//check if this mesh is already saved
	if(app.meshs[app.sd.toString]) {
		app.processData(app.meshs[app.sd.toString])
	}
	//make the call
	else {
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
	app.draw.dartBoard();
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
		app.drawCircle(app.ovCtx, (x*app.pixelSize) + app.pixelSize/2, (y*app.pixelSize) + app.pixelSize/2, 5);
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

app.drawCircle = function(ctx, x, y, rad) {
	ctx.beginPath();
	ctx.arc(x, y, rad, 0, Math.PI*2, true);
	ctx.stroke();
	ctx.closePath();
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
},{"../../modules/stats.js":1,"./draw.js":2}]},{},[3])