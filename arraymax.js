function maxXY(max) {
	var c = {'x':0,'y':0};
    for(x=0;x<app.data.length;x++){
    	for(y=0;y<app.data.length;y++){
        	if(app.data[x][y] == max) {
          		c.x = x;
          		c.y = y;
      		}
    	}
  	}
  	return c;
}