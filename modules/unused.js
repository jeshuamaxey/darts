app.fillMesh = function() {
	for (x = 0; x < config.meshSize; x++) {
		for (y = 0; y < config.meshSize; y++) {
			app.mesh[x][y] = db.dartboard(x,y);
		}
	}
}

app.fakeData = function(n) {
	for(c=0;c<n;c++) {
		var x = app.randomInt(config.meshSize);
		var y = app.randomInt(config.meshSize);
		app.addToMesh(x,y);
	}
}

app.addToMesh = function(meanX, meanY) {
	for (var x = app.mesh.length - 1; x >= 0; x--) {
		for (var y = app.mesh.length - 1; y >= 0; y--) {
			app.mesh[x][y] += stats.gaussian2D(x,y,meanX,meanY,400,400);//*db.dartboard(x,y);
		}
	}
}