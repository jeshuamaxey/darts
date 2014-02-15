'use strict';

var fs = require('fs');

var files = files || {};

files.makeList = function(dir) {
	//get dir listing as an array
	walk(dir, outputToFile);
}

//taken from incredible stackoverflow answer
//http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
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

module.exports = files;