var express = require("express");
var app = express();

app.configure(function(){
  app.use('/assets', express.static(__dirname + '/assets'));
  app.use('/src', express.static(__dirname + '/src'));
  app.use('/vendor', express.static(__dirname + '/vendor'));

  app.use(app.router);
});

app.get('/', function(req, res) {
  res.sendfile('index.html');
});

// app.get('*', function(req, res){
//   res.sendfile('index.html');
// });

app.get('/templates-common.js', function(req, res){
  res.sendfile('templates-common.js');
});

app.get('/templates-app.js', function(req, res){
  res.sendfile('templates-app.js');
});

//direct anything else back to the index
app.get('*', function(req, res){
  res.sendfile('index.html');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});