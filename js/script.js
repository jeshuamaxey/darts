var app = app || {};

app.main = function() {
	app.initialiseHeapmap();
	//app.drawDartBoard();
	app.refreshHeatMap();
}


app.initialiseHeapmap = function() {
	app.canvas = document.getElementById('heatmap');
	app.ctx = app.canvas.getContext('2d');
	app.hm = {};
	app.hm.width = 700;
	app.hm.height = app.hm.width;			//ensure square canvas
	app.hm.margin = 40;
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
	$.ajax('data/darts.json').done(app.generateHeatmap)
}

app.generateHeatmap = function(data) {
	var squareSize = 10;
	for (var x=0; x < data.length; x++) {
		for (var y=0; y < data.length; y++) {
			app.plotPixel(x*squareSize, y*squareSize, squareSize, data[x][y]);
		};
	};
}

app.plotPixel = function(x, y, size, val) {
	app.ctx.beginPath();
	app.ctx.rect(x, y, size, size);
  app.ctx.fillStyle = app.color(val); // 'rgba(255,255,255,1)';
  app.ctx.fill();
  app.ctx.lineWidth = 1;
  app.ctx.strokeStyle = 'black';
  app.ctx.stroke();
}

app.drawCircle = function(x, y, rad) {
	app.ctx.beginPath();
	app.ctx.arc(x, y, rad, 0, Math.PI*2, true);
	app.ctx.stroke();
	app.ctx.closePath();
}

app.color = function(val) {
	var color = 'rgba('+Math.floor(255*val/255)+','+Math.floor(255*val/255)+','+Math.floor(255*val/255)+',1)';
	console.log(color);
	return color;
}

//must go last
$(document).ready(app.main);