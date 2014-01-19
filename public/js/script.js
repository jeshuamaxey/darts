var app = app || {};

app.pixelSize = 2;

app.main = function() {
	app.initialiseHeapmap();
	//app.drawDartBoard();
	app.refreshHeatMap();
	$('#heatmap').mousemove(app.updateHoverPixel);
	$('#heatmap').click(app.updateFocusPixel)
}


app.initialiseHeapmap = function() {
	app.hmCanvas = document.getElementById('heatmap');
	app.hmCtx = app.hmCanvas.getContext('2d');
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
	$.ajax('data/darts.json').done(app.processData)
}

app.processData = function(data) {
	app.data = data;
	app.data.max = 0;
	app.data.forEach(function(arr) {
		arr.forEach(function(el) {
			el > app.data.max ? app.data.max = el : null;
		})
	});
	app.hm = {
		"width" : app.pixelSize*data.length,
		"height" : app.pixelSize*data.length,
		"margin" : 0
	}
	app.generateHeatmap();
	app.generateLegend();
}

app.generateLegend = function() {
	app.lgCanvas = document.getElementById('legend');
	app.lgCtx = app.lgCanvas.getContext('2d');
	app.lg = {
		"width" : app.pixelSize*app.data.length,//700,
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
	//console.log(e)
	var x = Math.floor(e.offsetX/app.pixelSize);
	var y = Math.floor(e.offsetY/app.pixelSize);
	var val = (app.data[x][y]);//.toFixed(3);
	//console.log(val)
	$('#hoverPixelValue').html(val);
}

app.updateFocusPixel = function(e) {
	//console.log(e)
	var x = Math.floor(e.offsetX/app.pixelSize);
	var y = Math.floor(e.offsetY/app.pixelSize);
	var val = (app.data[x][y]);//.toFixed(3);
	//console.log(val)
	$('#focusPixelValue').html(val);
}

app.resizeCanvas = function() {
	app.hmCanvas.style.width = "px";
	app.hmCanvas.style.height = "px";
}

app.plotPixel = function(x, y, size, val) {
	app.hmCtx.beginPath();
	app.hmCtx.rect(x, y, size, size);
  app.hmCtx.fillStyle = app.color(val/app.data.max); // 'rgba(255,255,255,1)';
  app.hmCtx.fill();
  // app.hmCtx.lineWidth = 0;
  // app.hmCtx.strokeStyle = 'black';
  // app.hmCtx.stroke();
}

app.drawCircle = function(x, y, rad) {
	app.hmCtx.beginPath();
	app.hmCtx.arc(x, y, rad, 0, Math.PI*2, true);
	app.hmCtx.stroke();
	app.hmCtx.closePath();
}

//takes a value in the range 0-1
app.color = function(val) {
	//var shade = Math.floor(val); //use to fake it
	var c = Math.floor(5*255*val);
	var r = 0, g = 0, b = 255;
	while(c > 0) {
		if(r==0 	&& g!=255 && b==255)	g++;	//rgb(0,0,255)		-> rgb(0,255,255)
		if(r==0 	&& g==255 && b!=0) 		b--;	//rgb(0,255,0)		-> rgb(0,255,0)
		if(r!=255 && g==255 && b==0) 		r++;	//rgb(0,255,0)		-> rgb(255,255,0)
		if(r==255 && g!=0 	&& b==0) 		g--;	//rgb(255,255,0)	-> rgb(255,0,	0)
		if(r==255 && g==0 	&& b!=255)	b++;	//rgb(255,0,0)		-> rgb(255,0,255)
		c--;
	}
	var color = 'rgba('+r+','+g+','+b+',1)';
	//var color = 'rgba('+88+','+shade+','+shade+',1)';
	return color;
}

//must go last
$(document).ready(app.main);