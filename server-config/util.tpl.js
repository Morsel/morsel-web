var app = require('./server');
var _ = require('underscore');

//any keys, tokens, etc
var apiQuerystring = '.json?client%5Bdevice%5D=webserver&client%5Bversion%5D=<%= version %>';
var devMixpanelToken = 'fc91c2a6f8d8388f077f6b9618e90499';
var facebookAppId = process.env.FACEBOOK_APP_ID || '1406459019603393';
var twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY || '12345';
var twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET || '12345';
var nodeEnv = process.env.NODE_ENV || 'development';
var sessionSecret = 'THESESESSIONSARENOTSECURE';

//static JSON data
var staticRoutes = require('./data/static-routes.json');
var metadata = require('./data/metadata.json');

//set up some app locals that will be rendered to any templates
app.locals.metabase = '/';
app.locals.siteURL= process.env.SITEURL || 'localhost:5000';
app.locals.apiUrl= process.env.apiUrl || 'http://api-staging.eatmorsel.com';
app.locals.mixpanelToken= process.env.MIXPANELTOKEN || devMixpanelToken;
app.locals.isProd= nodeEnv === 'production';

function updateMetadata(route){
  app.locals.metadata = getMetadata(route);
}

module.exports.updateMetadata = updateMetadata;

function getMetadata(route) {
  var mdata = _.find(metadata, function(r, ind) {
    return ind === route;
  });

  return _.defaults(mdata || {}, metadata.default);
}

module.exports.getMetadata = getMetadata;

function isStaticRoute(route){
  return _.find(staticRoutes, function(staticRoute) {
    return staticRoute === route;
  });
};

module.exports.isStaticRoute = isStaticRoute;

module.exports.truncateAt = function(text, limit) {
  return text.substring(0, limit);
};

function render404(res) {
  updateMetadata('404');

  res.status(404).render('404');
}

module.exports.render404 = render404;

module.exports.handleSingleRoute = function(req, res, next) {
  var route = req.params.route,
      request = require('request');

  //check against our known routes
  if(isStaticRoute(route)) {
    var staticApp = require('./apps/static');

    staticApp.renderStaticPage(res, route);
  } else {
    //check and see if it's a reserved route
    request(app.locals.apiUrl+'/configuration'+apiQuerystring, function (error, response, body) {
      var configData,
          nonUsernamePaths,
          //Maximum 15 characters (alphanumeric or _), must start with a letter
          usernameRegex = /^[a-zA-Z]\w{0,14}$/;

      if (!error && response.statusCode == 200) {
        configData = JSON.parse(body).data;
        nonUsernamePaths = configData.non_username_paths;

        if(_.find(nonUsernamePaths, function(path) {
          return path === route;
        })) {
          //this is a reserved path that isn't in use - send them to a 404
          render404(res);
        } else {
          //check and see if the route could be a valid username
          if(usernameRegex.test(route)) {
            //this could be a user
            var publicApp = require('./apps/public');
            publicApp.renderUserPage(res, route);
          } else {
            //not sure what this could be, send it to next route
            next();
          }
        }
      }
    });
  }
}

module.exports.facebookAppId = facebookAppId;
module.exports.sessionSecret = sessionSecret;
module.exports.twitterConsumerKey = twitterConsumerKey;
module.exports.twitterConsumerSecret = twitterConsumerSecret;
module.exports.apiQuerystring = apiQuerystring;
module.exports.defaultMetadata = metadata.default;