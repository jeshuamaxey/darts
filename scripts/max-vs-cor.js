/*
*  A script which aggregates the data from many heatmaps
*  of varying sd (sd.x = sd.y) and correlation to see how
*  the optimum aiming position changes with both
*/

var os = require('os');
var fs = require('fs');
var files = require('../modules/files.js');
var mesh = require('../modules/mesh.js');

var app = app || {};

//loop paramters
var sdMin = 10, sdMax = 30,
		sdStep = 5, sd;

var sdLoopLim = (sdMax-sdMin)/sdStep;

var corMin = -0.9, corMax = 1,
		corStep = 0.1;

var corLoopLim = (corMax-corMin)/corStep;

//to be filled with heatmap filenames
var heatmaps = [];
//to be filled with data series
var series = [];

var count = 0;

for(var i=0; i<sdLoopLim; i++) {
	sd = {'x': sdMin + sdStep*i,'y': sdMin + sdStep*i};
	series.push({
		'sd': sdMin + sdStep*i,
		'data': []
	});
	createCorrelationArray(sd, i);
}

/*
*
*
*/
function createCorrelationArray(sd, sdIndex) {
	//heatmaps arr is filled with file pathes
	heatmaps = [];
	for (var i = 0; i < corLoopLim; i++) {
		cor = corMin + corStep*i;
		heatmaps.push(__dirname + '/../public/data/heatmaps/' + files.generateFileName(sd, cor)) 
	};

	//each file is opened and the max value stored in series
	var c = 0;
	heatmaps.forEach(function(fileName, i) {
	  getMax(fileName, function(max, coords) {
	  	series[sdIndex].data.push({
	  		'cor': parseFloat((corMin + corStep*c).toFixed(2)),
	  		'max': max,//.toFixed(2),
	  		'coords': coords || {'x': 0,'y': 0}
	  	});
	  	c++;
	  	if(c == corLoopLim) c = 0;
	    count++;
	    if(i == heatmaps.length-1 && sd.x == sdMax - sdStep) {
	    	//once all the heatmaps have been reviewed, the data can be processed
	      processData(sd);
	    }
	  })
	});
}

/*
* Given a file path to a heatmap, this finds the max value in the heatmap
* and passes it to a callback
*/
function getMax(file, callback) {
	var max, coords;
	//if the file exists, find the max point
	if(fs.existsSync(file)) {
		//load up file
		fs.readFile(file, 'utf8', function (err, data) {
		  if (err) {
		    console.log('Error: ' + err);
		    return;
		  } else {
		  	//no error, find the max
		  	try {
		  		data = JSON.parse(data);
		  	} catch(e) {
		  		console.log("Parsing Error in file: "+ file);
		  		console.log("Error: "+e)
		  	}
		  	max = mesh.max(data);
		  	coords = mesh.maxXY(data);
		  }
		});
	} else {
		console.log(file + " NOT FOUND")
	}
	//do something with the max value
	setTimeout(function() { callback(max, coords); }, heatmaps.length*10);
}

function processData(sd) {
	
	var fileName = 'max-vs-cor';
	var dirName = __dirname + '/../public/data'
	// //generate a csv string
	var csv = 'cor';
	for(var i=0; i<sdLoopLim; i++) {
		sd = sdMin+sdStep*i;
		csv += ','+ sd;
	}
	csv += os.EOL;
	for(var i=0; i<corLoopLim; i++) {
		cor = corMin + corStep*i;
		csv += cor.toFixed(2) + ',';
		for(var j=0; j<sdLoopLim; j++) {
			csv += series[j].data[i].max;
			csv += (j!=sdLoopLim-1) ? ',' : os.EOL;
		}
	}
	//write json to file
	files.writeToFile(series, fileName+'.json', dirName);
	//write csv to file
  fs.writeFile(dirName+'/'+fileName+'.csv', csv, function(err) {
    if (err) throw err;
    console.log('file saved: ' + dirName+'/'+fileName+'.csv');
  });
} 