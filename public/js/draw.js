var draw = draw || {};

/*
* Takes three arguments:
* context: the canvas context used to draw
* canvas: the canvas element that pertains to the context
* dim: a dimensions object of the form {height: 100, width: 100}
*/

draw.dartBoard = function(context, canvas, dim) {
	//set metrics
	var db = {};
	db.x = dim.width/2; // db.x is the central x coordinate.
	db.y = dim.height/2; // db.y is the central y coordinate.
	db.rad = dim.width/2;
	
	//treble ring
	draw.circle(context, db.x, db.y, db.rad*99/200);
	draw.circle(context, db.x, db.y, db.rad*107/200);
	//double ring
	draw.circle(context, db.x, db.y, db.rad*170/200);
	draw.circle(context, db.x, db.y, db.rad*162/200);
	//bull
	draw.circle(context, db.x, db.y, db.rad*6.35/200);
  draw.circle(context, db.x, db.y, db.rad*15.9/200);

	var theta, innerX, innerY, outerX, outerY;

	for (var i = 0; i < 20; i++) {
		//Math.PI not Math.Pi
		theta = Math.PI/20 + i*(Math.PI/10);
		innerX = Math.round((db.rad*15.9/200) * Math.cos(theta) + db.x);
		innerY = Math.round(db.y - ((db.rad*15.9/200) * Math.sin(theta)));
		outerX = Math.round(((db.rad*170/200) * Math.cos(theta)) + db.x);
		outerY = Math.round(db.y - ((db.rad*170/200) * Math.sin(theta)));
		
  	context.beginPath();
    context.moveTo(innerX, innerY);
  	context.lineTo(outerX, outerY);
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

module.exports = draw;