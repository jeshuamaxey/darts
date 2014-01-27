/*
* All private variables and functions are attached to the priv object
* which is not exported
*/

var priv = priv || {};

//stores previously calculated values of the factorial function
priv.f = [];

/*
* All public variables and functions are attached to the stats object
* which is exported at the end of the module
*/
var stats = stats || {};
/*
* Returns the value of a 1D Gaussian PDF, centerd at meanX
* and standard deviations sdX, at x. When only x is
* provided as an argument it defaults to a normal distribution 
*/
stats.gaussian1D = function(x, meanX, sdX) {
	var meanX = meanX || 0;
	var sdX = sdX || 1;
	var varX = sdX*sdX;

  var m = stats.stdDev * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - stats.mean, 2) / (2 * stats.variance));
  return e / m;
}

/*
* Returns the value of a 2D Gaussian PDF, centerd at (meanX,meanY)
* and standard deviations sdX & sdY, at (x,y). When only x & y are
* provided as arguments it defaults to a normal distribution 
*/
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

/*
*
*
*/
stats.calcStandardDev = function(accuracy) {
	return config.meshSize*config.meshRatio.bullseye/0.4;
}

/*
* Returns th value of the error function, accurate to 9 decimal places
*/
stats.erf = function(x) {
	var k=0, el=0, sum=0;
	do {
		el = ( Math.pow(-1,k) / ( (2*k +1)*stats.factorial(k) ) ) * Math.pow(x, 2*k);
		sum += el;
		k++;
	} while(el > 0.000000001)
	return ((2*x/Math.sqrt(Math.PI))*sum).toFixed(9);
}

/*
*/
stats.factorial = function(n) {
  if (n == 1 || n == 0)
    return 1;
  if (priv.f[n] > 0)
    return priv.f[n];
  return priv.f[n] = stats.factorial(n-1) * n;
}

module.exports = stats;