/*
*	A script to  output throw data in the following csv format
*
*	throw,x,y
*	1,23,34
*	2,43,12
*	etc
*/

var fs = require('fs');
var os = require('os');
var files = require('../modules/files.js');
var stats = require('../modules/stats.js')

var dir = '../public/data/throw-data/';
var file = '010';

var app = {};

fs.readFile(dir+file+'.json', 'utf8', function (err, data) {
	//check for error
  if (err) {
    console.log('Error: ' + err);
    return;
  }

  //if no error, get to work
  app.data = JSON.parse(data);

	//generate a csv string
	var csv = 'throw,x,y' + os.EOL;
	//fill the csv with data
	app.data.raw['throws'].forEach(function(t, i) {
		csv += i+1 + ',' + t.mmX + ',' + t.mmY + os.EOL;
	});
	//write data to file
	fs.writeFile(dir+'csv/'+file+'.csv', csv, function(err) {
    if (err) throw err;
    console.log('file saved: ' + dir+file+'.csv');
  });
});