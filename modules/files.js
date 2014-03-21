'use strict';

var fs = require('fs');

var files = files || {};

files.makeList = function(dir) {
  //deal with that pesky .DS_Store file in OSX
  fs.unlink('./**/.DS_Store', function(err){});
	//get dir listing as an array
	walk(dir, outputToFile);
}

//taken from incredible stackoverflow answer
//http://stackoverflow.com/questions/5827612
function walk(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

/*
* private function of the module
*/
function outputToFile(err, list) {

	var outputFile = 'public/data/data-files.json';
  
  //strip off the public from the start of the strings
  list.forEach(function(filePath, i) {
    list[i] = filePath.substring('public/'.length);
  })

  var data = { 'list' : list };
  var dataStr = JSON.stringify(data);

	fs.writeFile(outputFile, dataStr, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("Files listed in " + outputFile);
		}
	});
	return false;
}

files.generateFileName = function(sd) {
  var fileName = '';
  //x
  fileName += 'sdx-';
  if(sd.x<10) fileName += '0';
  if(sd.x<100) fileName += '0';
  fileName += sd.x.toFixed(1);
  //y
  fileName += '-sdy-';
  if(sd.y<10) fileName += '0';
  if(sd.y<100) fileName += '0';
  fileName += sd.y.toFixed(1);
  //extension
  fileName += '.json';

  return fileName;
}

//save data to file
files.writeToFile = function(data, fileName, dir) {
  var outFile = (dir || 'public/data/') + (fileName || 'output.json');

  fs.writeFile(outFile, JSON.stringify(data, null, 2), function(err) {
    if(err) {
      console.log(err);
    }
  });
}

module.exports = files;