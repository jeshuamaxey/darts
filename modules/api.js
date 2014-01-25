var qs = require('querystring');
var fs = require('fs');

//exported namespace
var api = api || {};
//private namespace
var priv = priv || {};

priv.outFileDir = 'public/data/throw-data/';

api.storeThrows = function(req, res) {
	req.setEncoding("utf8");
	req.content = '';
	var data = req.body;

	//console.log(data)

	priv.writeToFile(data.fileName, data);
}

priv.writeToFile = function(fileName, data) {
	//set unique filename
	//fileName = fileName || priv.generateFilename();
	var outFilePath = priv.outFileDir + (fileName || priv.generateFilename());

	fs.writeFile(outFilePath, JSON.stringify(data, null, 2), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved to " + outFilePath);
	    }
	});
}

priv.generateFilename = function() {
	//find the number of output files already saved
	fs.readdir(priv.outFileDir, function(err, list) {
		console.log(list)
		return list.length + '.json';
	});
}

//removes all compounded file extensions from a string
priv.removeExt = function(string) {
	if(string == string.replace(/\.[^/.]+$/, ''))
		return string;
	else
		return priv.removeExt(string.replace(/\.[^/.]+$/, ''));
}

module.exports = api;