function maxXY(arr) {
  var max = 0;
	var c = {'x': 0;'y': 0};
  //begin search
  for(x=0;x<arr.length;x++){
  	for(y=0;y<arr.length;y++){
      	if(arr[x][y] > max) {
          max = arr[x][y]; 
        	c.x = x;
          c.y = y;
    		}
  	}
	}
	return c;
}