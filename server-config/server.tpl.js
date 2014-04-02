var express = require("express"),
    mustacheExpress = require('mustache-express'),
    _ = require('underscore'),
    routes = require('./data/routes.json'),
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

app.get('/', function(req, res) {
  renderAngular(req, res);
});

app.get('/templates-common.js', function(req, res){
  res.sendfile('templates-common.js');
});

app.get('/templates-app.js', function(req, res){
  res.sendfile('templates-app.js');
});

//morsel detail with post id/slug
app.get('/:username/:postidslug', function(req, res){
  console.log('got user '+ req.params.username+' with postid '+req.params.postidslug);
  //we have to test to see if it's a username

  //in the meantime, just send them to angular
  renderAngular(req, res);
});

//anything with a single route param
app.get('/:route', function(req, res){
  //check against our known routes
  if(isRoutePrivateAndActive(req.params.route)) {
    console.log(req.params.route+' is private');
    //if it's not public, we don't care about getting metadata/content right - send req to angular
    renderAngular(req, res);
  } else {
    console.log(req.params.route+ ' is public');
    //we have to test to see if it's a username

    //in the meantime, just send them to angular
    renderAngular(req, res);
  }
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

function renderAngular(req, res) {
  res.render('index');
}

function isRoutePrivateAndActive(route) {
  return _.find(routes, function(r) {
    return (r.name === route) && !r.public && r.active;
  });
}