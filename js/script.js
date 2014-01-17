var app = app || {};

app.main = function() {
	app.initialiseHeapmap();
	app.drawDartBoard();
}


app.initialiseHeapmap = function() {
	app.canvas = document.getElementById('heatmap');
	app.ctx = app.canvas.getContext('2d');
	app.hm = {};
	app.hm.width = 700;
	app.hm.height = app.hm.width;			//ensure square canvas
	app.hm.margin = 40; //top, right, left, bottom
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

app.drawCircle = function(x, y, rad) {
	app.ctx.beginPath();
	app.ctx.arc(x, y, rad, 0, Math.PI*2, true);
	app.ctx.stroke();
	app.ctx.closePath();
}

//must go last
$(document).ready(app.main);