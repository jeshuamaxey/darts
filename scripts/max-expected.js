/*
* This scripts loads in each symmetric heatmap in turn and
* records their max values to be plotted in a simple line graph
* against standard deviation
*/

/*
* 3rd Party Modules
*/
var fs = require('fs');
var os = require('os');
var progressBar = require('progress');
var json2csv = require('json2csv');

var mesh = require('../modules/mesh.js');
var files = require('../modules/files.js');

//loop paramters
var sdMin = 0.5, sdMax = 100.5,
		sdStep = 0.5, sd;

var loopLim = (sdMax-sdMin)/sdStep;

//to be filled with heatmap filenames
var heatmaps = [];
//to be filled with data series
var series = [];

//heatmaps arr is filled with file pathes
for (var i = 0; i < loopLim; i++) {
	sd = {'x': sdMin + sdStep*i,'y': sdMin + sdStep*i};
	heatmaps.push(__dirname + '/../public/data/symmetric/' + files.generateFileName(sd)) 
};

//each file is opened and the max value stored in series
heatmaps.forEach(function(fileName, i) {
  getMax(fileName, function(max, coords) {
  	series.push({
  		'sd': sdMin + sdStep*i,
  		'max': max,
  		'coords': coords || {'x': 0,'y': 0}
  	});
    if(series.length == heatmaps.length) {
    	//once all the heatmaps have been reviewed, the data can be processed
      processData();
    }
  })
});

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

function processData() {
	var fileName = 'max-expected';
	var dirName = __dirname + '/../public/data'
	//generate a csv string
	var csv = 'sd,max,x,y' + os.EOL;
	series.forEach(function(s) {
		//console.log(s.coords)
		csv += s.sd + ',' + s.max + ',' + s.coords.x + ',' + s.coords.y + os.EOL;
	});
	//write json to file
	files.writeToFile(series, fileName+'.json', dirName);
	//write csv to file
  fs.writeFile(dirName+'/'+fileName+'.csv', csv, function(err) {
    if (err) throw err;
    console.log('file saved: ' + dirName+fileName+'.csv');
  });
} 