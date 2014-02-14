/*var express = require('express'),
    app = express();

app.configure(function(){
  app.use('/assets', express.static(__dirname + '/assets'));
  app.use(app.router);
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

//index
app.get('*', function(req, res){
  res.sendfile('index.html');
});

app.listen(5000);
*/

// web.js
var express = require("express");
var app = express();

app.get('/', function(req, res) {
  res.send('Hello World!');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});