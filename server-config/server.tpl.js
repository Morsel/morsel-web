var express = require("express"),
    mustacheExpress = require('mustache-express'),
    _ = require('underscore'),
    routes = require('./data/routes.json'),
    request = require('request'),
    metadata = require('./data/metadata.json'),
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
  renderAngular(res, findMetadata(''));
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
  
  getMorselMetadata(res);
});

//anything with a single route param
app.get('/:route', function(req, res){
  var route = req.params.route;

  //check against our known routes
  if(isValidStaticRoute(route)) {
    //check if it's a public route - public routes could have unique metadata
    if(isRoutePublic(route)) {
      console.log(route+ ' is public');
      //need to check for metadata
      console.log('found:',findMetadata(route));
      renderAngular(res, findMetadata(route));
    } else {
      console.log(route+' is private');
      //if it's not public, we don't care about getting metadata/content customized - send req to angular
      renderAngular(res);
    }
  } else {
    //either a user's profile page or a bad route
    getUserMetadata(res);
  }
});

//anything else must be a 404 at this point - this will obviously change
app.get('*', function(req, res) {
  render404(res);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

function renderAngular(res, mData) {
  var fullMetadata = mData || findMetadata('default');

  res.render('index', {
    metadata: fullMetadata
  });
}

function isValidStaticRoute(route) {
  return _.find(routes, function(r, ind) {
    return (ind === route) && r.active;
  });
}

function isRoutePublic(route) {
  return _.find(routes, function(r, ind) {
    return (ind === route) && r.public;
  });
}

function findMetadata(route) {
  var mdata = _.find(metadata, function(r, ind) {
    return ind === route;
  });

  return _.defaults(mdata || {}, metadata.default);
}

function getUserMetadata(res) {
  renderAngular(res);

  /*request('./data/fakeuser.json?api_key=1&device=web', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      renderAngular(res, JSON.parse(body).data);
    } else {
      //not a valid user - must be a bad route
      render404(res);
    }
  });*/
}

function getMorselMetadata(res) {
  renderAngular(res);

  /*request('./data/fakeuser.json?api_key=1&device=web', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      renderAngular(res, JSON.parse(body).data);
    } else {
      //not a valid user - must be a bad route
      render404(res);
    }
  });*/
}

function render404(res) {
  res.render('404', {
    metadata: findMetadata('404')
  });
}