drawDartBoard = function() {
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

drawDartBoard();