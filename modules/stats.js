var stats = stats || {};

stats.gaussian1D = function(x, meanX, varX) {
	var meanX = meanX || 0;
	var varX = varX || 1;
	var stdDev = Math.sqrt(varX);

  var m = stats.stdDev * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - stats.mean, 2) / (2 * stats.variance));
  return e / m;
}

stats.gaussian2D = function(x, y, meanX, meanY, sdX, sdY) {
	var meanX = meanX || 0;
	var meanY = meanY || 0;
	var sdX = sdX || 1;
	var sdY = sdY || 1;
	var varX = sdX*sdX;
	var varY = sdY*sdY;
	//check the normalisation constant
  var e = Math.exp( - ( Math.pow(x - meanX, 2) / (2 * sdX) + Math.pow(y - meanY, 2) / (2 * sdY) ) );
  var m = sdX * sdY * Math.sqrt(2 * Math.PI);
  return ( (e / m) < 0.00001 ? 0 : e/m );
}

stats.calcStandardDev = function(accuracy) {
	return config.meshSize*config.meshRatio.bullseye/0.4;
}

module.exports = stats;