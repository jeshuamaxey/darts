var qs = require('querystring');
var fs = require('fs');

//exported namespace
var api = api || {};
//private namespace
var priv = priv || {};

priv.outFileDir = 'public/data/throw-data/';

api.storeThrows = function(req, res) {
	req.setEncoding("utf8");
	var data = req.body;

	//set unique filename
	priv.fileName = false;
	priv.generateFilename();

	interval = setInterval(function() {
		if(priv.fileName) {
			priv.writeToFile(req, res, interval);
		}
	}, 10);
};

priv.writeToFile = function(req, res, interval) {
	clearInterval(interval);
	//create whole file path
	var outFilePath = priv.outFileDir + (req.body.fileName || priv.fileName);
	//write data to file
	fs.writeFile(outFilePath, JSON.stringify(req.body, null, 2), function(err) {
	    if(err) {
	    	res.send();
	      console.log(err);
	    } else {
	      console.log("JSON saved to " + outFilePath);
	      res.send();
	    }
	});
};

priv.generateFilename = function() {
	//find the number of output files already saved
	fs.readdir(priv.outFileDir, function(err, list) {
			var num = list.length;
			if(list.length < 100) num = '0' + num;
			if(list.length < 10) num = '0' + num;
			priv.fileName = num + '.json';
		});
};

//removes all compounded file extensions from a string
priv.removeExt = function(string) {
	if(string == string.replace(/\.[^/.]+$/, ''))
		return string;
	else
		return priv.removeExt(string.replace(/\.[^/.]+$/, ''));
}

module.exports = api;