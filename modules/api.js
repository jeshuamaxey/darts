var qs = require('querystring');
var fs = require('fs');

var hm = require('./heatmap.js');
var files = require('./files.js');

//exported namespace
var api = api || {};
//private namespace
var priv = priv || {};

priv.outFileDir = 'public/data/throw-data/';

api.status = function(req, res) {
	res.send({
		'status': 'OK'
	});
}

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

//
api.getFileList = function(req, res) {
	var list = fs.readdirSync('public/data/throw-data');
	if(list[0] == ".DS_Store") {
		res.send(list.splice(1))
	} else {
		res.send(list);
	}
}

//
api.makeHeatmap = function(req, res) {
	req.setEncoding("utf8");
	var sd = {
		'x': parseFloat(req.body.x),
		'y': parseFloat(req.body.y)
	};
	
	//generate data
	var mesh = hm.generateHeatmap({'x':0, 'y':0}, sd);

	//write data to file
	var fileName = files.generateFileName(sd);
	files.writeToFile(mesh, fileName, '../public/data/symmetric');
	
	//send data to client
	res.send(mesh)
}

/*
* PRIVATE FUNCTIONS
*/

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
			var num = list.length+1;
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