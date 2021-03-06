/*
* All private variables and functions are attached to the priv object
* which is not exported
*/

var priv = priv || {};

//stores previously calculated values of the factorial function
priv.f = [];

//stores previously calculated values of returnStdDev
priv.rSD = [1000];
// priv.rSD[0] = 1000 and represents the standard deviation for 0% of darts in bull.

/*
* All public variables and functions are attached to the stats object
* which is exported at the end of the module
*/
var stats = stats || {};
/*
* Returns the value of a 1D Gaussian PDF, centerd at meanX
* and standard deviation sdX, at x. When only x is
* provided as an argument it defaults to a normal distribution 
*/
stats.gaussian1D = function(x, meanX, sdX) {
	var meanX = meanX || 0;
	var sdX = sdX || 1;
	var varX = sdX*sdX;

  var m = sdX * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - meanX, 2) / (2 * varX));
  return e / m;
}

/*
* Returns the value of a 2D Gaussian PDF, centerd at (meanX,meanY)
* and standard deviations sdX & sdY, at (x,y). When only x & y are
* provided as arguments it defaults to a normal distribution 
*/

// This gaussian2D function is being updated to be a bivariate Gaussian
// If it receives no correlation number then it is defaulted to zero and
// remains a normal uncorrelated Gaussian
stats.gaussian2D = function(x, y, meanX, meanY, sdX, sdY, corr) {
	var meanX = meanX || 0;
	var meanY = meanY || 0;
	var sdX = sdX || 1;
	var sdY = sdY || 1;
	var corr = corr || 0;
	var varX = sdX*sdX;
	var varY = sdY*sdY;
	//check the normalisation constant
	// The setting of these variables makes sense if you visit http://mathworld.wolfram.com/BivariateNormalDistribution.html
	var expX = Math.pow( (x-meanX)/sdX , 2);
	var expY = Math.pow( (y-meanY)/sdY , 2);
	var expcorr = 2*corr*(x-meanX)*(y-meanY)/(sdX*sdY);
	var z = expX - expcorr + expY;
  	var e = Math.exp(-z/(2*(1-corr*corr)));
  	var m = sdX * sdY * 2 * Math.PI * Math.sqrt(1-(corr*corr));
  	return ( (e / m) < 0.00000001 ? 0 : e/m );
}



// Currently going to have accuracy as a fraction rather than a percentage
stats.calcStandardDev = function(accuracy) {
	return config.meshSize*config.meshRatio.bullseye/0.4;
}

/*
* Returns th value of the error function, accurate to 9 decimal places
*/
stats.erf = function(x) {
	var k=0, el=0, sum=0;
	do {
		el = ( Math.pow(-1,k) / ( (2*k +1)*stats.factorial(k) ) ) * Math.pow(x, (2*k)+1);
		sum += el;
		k++;
	} while(Math.abs(el) > 0.000000001)
	var ans = ((2*sum/Math.sqrt(Math.PI))).toFixed(9);
	return (ans == 'NaN' ? 1 : ans);
}

stats.factorial = function(n) {
  if (n == 1 || n == 0)
    return 1;
  if (priv.f[n] > 0)
    return priv.f[n];
  return priv.f[n] = stats.factorial(n-1) * n;
}

/*
* returns the mean value of an array
*/
stats.mean = function(arr) {
	var N = arr.length;
	var total = 0;
	for (var i = arr.length - 1; i >= 0; i--) {
		total += arr[i];
	};
	return total/N;
}

/*
* returns the standard deviation of an array
*/
stats.stdDev = function(arr, mean) {
	var N = arr.length;
	//if mean is not provided as an arg, calculate it
	var mean = mean || stats.mean(arr);
	var variance = 0;
	for (var i = arr.length - 1; i >= 0; i--) {
		variance += Math.pow((arr[i] - mean), 2);
	};
	return Math.sqrt(variance/(N-1));
}

// erf(n divided by root 2) = fraction of darts thrown contained within the n sigma
// interval.
// For a given percentage of darts within the bull, n values are trialled in the error
// function until one falls within an error bound of the percentage we want.
stats.returnStdDev = function(percentage) {
	trialn = 1; // erf(0) is not defined.
	percentage = Math.round(percentage*2)/2;
	if (priv.rSD[percentage*2] > 0) {
		return priv.rSD[percentage*2];
	}
	for (var i = 1; i <= percentage*2; i++) {
		var resultaccuracy = 0;
		do {
			resultaccuracy = stats.erf((trialn/1000)*Math.pow(2, -0.5));
			trialn += 1;
		}
		while (resultaccuracy < ((i/200) - 0.0005) || resultaccuracy > ((i/200) +0.0005))
	}
	return priv.rSD[percentage*2] = 1/((trialn/1000)-0.001);
}

/*
* returns the x and y coords of the largest value in a 2d array
*/
stats.maxXY = function(arr) {
  var max = 0;
	var c = {'x': 0,'y': 0};
  //begin search
  for(x=0;x<arr.length;x++) {
  	for(y=0;y<arr.length;y++) {
      	if(arr[x][y] > max) {
          max = arr[x][y]; 
        	c.x = x;
          c.y = y;
    		}
  	}
	}
	return c;
}

stats.correlation = function(twoDData, meanX, meanY, sdX, sdY) {
	//function takes an array called
	var sum = 0;
	for (var i=0; i < twoDData.length; i++) {
		sum += (twoDData[i]["mmX"]*twoDData[i]["mmY"]);
	}
	sum = sum/twoDData.length;
	return (sum - meanX*meanY)/(sdX*sdY);
}


stats.median = function(twoDData, xOrY) {
	// Need to sort the data first
	// Put the data in a new array
	var arr = [];
	for (var i = 0; i < twoDData.length; i++) {
		arr.push(twoDData[i][xOrY]);
	}
	// Sort it
	arr.sort(function(a,b){return a-b});
	// Select out the median
	// Different method for even and odd n
	if (arr.length % 2 == 0) {
		return (arr[arr.length/2] + arr[(arr.length/2)-1])/2;
	}
	else {
		return arr[(arr.length/2)-0.5];
	}
}


// This function calculates the skew as stated in the definition here:
// http://en.wikipedia.org/wiki/Skewness
// The fourth argument needs to take a string "mmX" or "mmY"
stats.skew = function(twoDData, mean, sd, xOrY) {
	var sum = 0;
	for (var i = 0; i < twoDData.length; i++) {
		sum += Math.pow((twoDData[i][xOrY]), 3);
	}
	sum = sum / twoDData.length;
	var termTwo = 3*mean*sd*sd;
	var termThree = mean*mean*mean;
	var denominator = sd*sd*sd;
	return (sum - termTwo - termThree)/denominator;
}

// This function calculates Pearson's Second Coeefficient of Skewness
// A supposedly simpler measure of skew and talked about here:
// http://en.wikipedia.org/wiki/Skewness
stats.pearsonSecond = function(twoDData, mean, sd, xOrY) {
	// First, calculate the median
	var median = stats.median(twoDData, xOrY);
	return 3*(mean - median)/sd;
}

// A little bit of a test for the correlation function
// This data here is the data from this video: http://www.videojug.com/film/how-to-calculate-covariance

// And was used for testing the correlation function

/*

someData = [

// mean x = 5, sd x = Math.sqrt(20/3)
// mean y = 8, sd y = Math.sqrt(28/3)
// Pearson's coefficient of skewness is zero for both mmX and mmY as mean = median
	{
		"mmX":1,
		"mmY":5
	},
	{
		"mmX":2,
		"mmY":4
	},
	{
		"mmX":3,
		"mmY":5
	},
	{
		"mmX":4,
		"mmY":6
	},
	{
		"mmX":5,
		"mmY":8
	},
	{
		"mmX":6,
		"mmY":9
	},
	{
		"mmX":7,
		"mmY":10
	},
	{
		"mmX":8,
		"mmY":13
	},
	{
		"mmX":9,
		"mmY":12
	},
]

*/

/*
// Some outputs for testing

console.log(stats.median(someData, "mmY"));
console.log("Pearson's coefficient = " + stats.pearsonSecond(someData, 8, Math.sqrt(28/3), "mmY"));
console.log("Definition Skew X = "+stats.skew(someData, 5, Math.sqrt(20/3), "mmX"))
console.log("Definition Skew Y = "+stats.skew(someData, 8, Math.sqrt(28/3), "mmY"))
console.log(stats.median(someData, "mmY"));

*/


module.exports = stats;