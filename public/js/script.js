var app = app || {};

app.colorScheme = 'bw';

app.pixelSize = 2;

app.hm = {
	"width" : 800,
	"height" : 800,
	"margin" : 0
}

app.main = function() {
	app.initialiseCanvases();
	//app.drawDartBoard();
	app.refreshHeatMap();
	$('#canvasWrapper').mousemove(app.updateHoverPixel);
	$('#canvasWrapper').on("click", app.updateFocusPixel);
	$('#colorScheme').on('change', app.refreshHeatMap)
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

app.drawDartBoard = function() {
	//set metrics
	app.db = {};
	app.db.x		= ( app.hm.width - (2*app.hm.margin) ) / 2 + app.hm.margin;
	app.db.y 		= ( app.hm.width - (2*app.hm.margin) ) / 2 + app.hm.margin;
	app.db.rad 	= ( app.hm.width - (2*app.hm.margin) ) / 2;
	//draw
	//draw perimeter
  app.drawCircle(app.db.x, app.db.y, app.db.rad+(app.hm.margin));
  //treble ring
  app.drawCircle(app.db.x, app.db.y, app.db.rad);
  app.drawCircle(app.db.x, app.db.y, app.db.rad-20);
  //double ring
  app.drawCircle(app.db.x, app.db.y, app.db.rad-110);
  app.drawCircle(app.db.x, app.db.y, app.db.rad-110-20);
  //bull
  app.drawCircle(app.db.x, app.db.y, app.db.rad-285);
  app.drawCircle(app.db.x, app.db.y, app.db.rad-285-10);
}

app.refreshHeatMap = function() {
	app.colorScheme = ( $('#colorScheme').is(':checked') ? 'color' : 'bw')
	var url = 'data/' + ($('#fileName').val() || 'darts.json'); 
	$.ajax({
			url: url,
			cache: false
		})
		.done(app.processData)
		.fail(app.failedAJAX)
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
}

app.failedAJAX = function() {
	$('#failedAJAX').modal('show');
}

app.generateLegend = function() {
	app.lgCanvas = document.getElementById('legend');
	app.lgCtx = app.lgCanvas.getContext('2d');
	app.lg = {
		"width" : app.hm.width,
		"height" : 40,
		"margin" : 10
	};
	for(c=0;c<app.lg.width;c++) {
		app.lgCtx.beginPath();
		app.lgCtx.rect(c,0,1,app.lg.height);
		app.lgCtx.fillStyle = app.color(c/app.lg.width);
		app.lgCtx.fill();
	}
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
	console.log(e.offsetX, e.offsetY)
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