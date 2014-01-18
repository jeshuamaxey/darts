var app = app || {};

app.pixelSize = 7;

app.main = function() {
	app.initialiseHeapmap();
	//app.drawDartBoard();
	app.refreshHeatMap();
	app.generateLegend();
}


app.initialiseHeapmap = function() {
	app.hmCanvas = document.getElementById('heatmap');
	app.hmCtx = app.hmCanvas.getContext('2d');
	app.hm = {
		"width" : 700,
		"height" : 700,
		"margin" : 40
	}
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
	})
	app.generateHeatmap();
}

app.generateLegend = function() {
	app.lgCanvas = document.getElementById('legend');
	app.lgCtx = app.lgCanvas.getContext('2d');
	app.lg = {
		"width" : 700,
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
	var c = Math.floor(4*255*val);
	var r = 0, g = 0, b = 255;
	while(c > 0) {
		if(g<255 && b==255) g++;
		if(g==255 && b!=0) b--;
		if(g==255 && b==0 && r!=255) r++;
		if(r==255) g--;
		c--;
	}
	var color = 'rgba('+r+','+g+','+b+',1)';
	//var color = 'rgba('+88+','+shade+','+shade+',1)';
	return color;
}

//must go last
$(document).ready(app.main);