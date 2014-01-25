var express = require('express');
var path = require('path');

var api = require('./modules/api');

var app = express();

//for serving static pages
app.use(express.static(path.join(__dirname, 'public')));
//for parsing the POSTs in the API
app.use(express.bodyParser());

app.post('/api/store', api.storeThrows);

app.listen(3000);