var mesh = mesh || {};

/*
* creates a square 2D mesh with dimensions size x size
*/
mesh.make2DMesh = function(size) {
	var arr = new Array(size);
	for (var i = arr.length - 1; i >= 0; i--) {
		arr[i] = new Array(size);
	}
	return arr;
};

/*
* sets all elements in the mesh to zero
*/
mesh.zeroMesh = function(mesh) {
	for (x = 0; x < mesh.length; x++) {
		for (y = 0; y < mesh.length; y++) {
			mesh[x][y] = 0;
		};
	};
}

//Sums all the elements in a mesh

mesh.sumMesh = function(mesh) {
	var sum = 0;
	for (var x = 0; x < mesh.length; x++) {
		for (var y = 0; y < mesh[x].length; y++) {
			sum += mesh[x][y];
		};
	};
	return sum;
}

mesh.normaliseMesh = function(meshToBeNormalised) {
	var factor = mesh.sumMesh(meshToBeNormalised);
	for (var x = 0; x < meshToBeNormalised.length; x++) {
		for (var y = 0; y < meshToBeNormalised[x].length; y++) {
			meshToBeNormalised[x][y] = meshToBeNormalised[x][y]/factor;
		}
	}
	return meshToBeNormalised;
}

mesh.maxXY = function(mesh) {
  var max = 0;
	var c = {'x': 0,'y': 0};
  //begin search
  for(x=0;x<mesh.length;x++){
  	for(y=0;y<mesh.length;y++){
      	if(mesh[x][y] > max) {
          max = mesh[x][y]; 
        	c.x = x;
          c.y = y;
    		}
  	}
	}
	return c;
}

mesh.max = function(mesh) {
  var max = 0;
  //begin search
  for(x=0;x<mesh.length;x++){
    for(y=0;y<mesh.length;y++){
        if(mesh[x][y] > max) {
          max = mesh[x][y]; 
        }
    }
  }
  return max;
}

module.exports = mesh;