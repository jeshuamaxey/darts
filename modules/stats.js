var stats = stats || {};

stats.gaussian1D = function(x, meanX, varX) {
	var meanX = meanX || 0;
	var varX = varX || 1;
	var stdDev = Math.sqrt(varX);

  var m = stats.stdDev * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - stats.mean, 2) / (2 * stats.variance));
  return e / m;
}

stats.gaussian2D = function(x, y, meanX, meanY, varX, varY) {
	var meanX = meanX || 0;
	var meanY = meanY || 0;
	var varX = varX || 1;
	var varY = varY || 1;
	var sdX = Math.sqrt(varX);
	var sdY = Math.sqrt(varY);
	//check the normalisation constant
  var e = Math.exp( - ( Math.pow(x - meanX, 2) / (2 * sdX) + Math.pow(y - meanY, 2) / (2 * sdY) ) );
  var m = sdX * sdY * Math.sqrt(2 * Math.PI);
  return ( (e / m) < 0.00001 ? 0 : e/m );
}

module.exports = stats;