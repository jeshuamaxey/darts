var express = require('express');
var path = require('path');

var api = require('./modules/api');

var app = express();
var port = 3000;

//for serving static pages
app.use(express.static(path.join(__dirname, 'public')));
//for parsing the POSTs in the API
app.use(express.urlencoded());

//GET
app.get('/api/getFileList', api.getFileList);

//POST
app.post('/api/store', api.storeThrows);

app.listen(port);

console.log("Server running at http://localhost:" + port)
