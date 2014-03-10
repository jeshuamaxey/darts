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

module.exports = mesh;