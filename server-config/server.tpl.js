var express = require("express"),
    mustacheExpress = require('mustache-express'),
    app = express();

app.engine('mustache', mustacheExpress());

app.configure(function(){
  app.set('view engine', 'mustache');
  app.set('views', __dirname + '/views');

  app.use('/assets', express.static(__dirname + '/assets'));
  app.use('/src', express.static(__dirname + '/src'));
  app.use('/vendor', express.static(__dirname + '/vendor'));

  app.use(app.router);
});

function renderAngular(req, res) {
  res.render('index');
}
app.get('/', function(req, res) {
  renderAngular(req, res)
});

app.get('/templates-common.js', function(req, res){
  res.sendfile('templates-common.js');
});

app.get('/templates-app.js', function(req, res){
  res.sendfile('templates-app.js');
});

//direct anything else back to the index
app.get('*', function(req, res){
  renderAngular(req, res)
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});