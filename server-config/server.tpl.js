var express = require("express"),
    mustacheExpress = require('mustache-express'),
    _ = require('underscore'),
    routes = require('./data/routes.json'),
    request = require('request'),
    metadata = require('./data/metadata.json'),
    currEnv = process.env.CURRENV || 'development',
    isProd = currEnv === 'production',
    siteURL = process.env.SITEURL || 'localhost:5000',
    apiURL = process.env.APIURL || 'http://api-staging.eatmorsel.com',
    apiQuerystring = '.json?client%5Bdevice%5D=webserver&client%5Bversion%5D=<%= version %>',
    devMixpanelToken = 'fc91c2a6f8d8388f077f6b9618e90499',
    mixpanelToken = process.env.MIXPANELTOKEN || devMixpanelToken,
    metabase = '/',
    app = express();

app.engine('mustache', mustacheExpress());

app.configure(function(){
  app.set('view engine', 'mustache');
  app.set('views', __dirname + '/views');

  app.use('/assets', express.static(__dirname + '/assets'));
  app.use('/src', express.static(__dirname + '/src'));
  app.use('/vendor', express.static(__dirname + '/vendor'));
  app.use('/launch', express.static(__dirname + '/launch'));

  app.use(app.router);
});

app.get('/', function(req, res) {
  res.render('claim', {
    siteUrl : siteURL,
    isProd : isProd,
    apiURL : apiURL,
    mixpanelToken : mixpanelToken
  });
});

app.get('/templates-common.js', function(req, res){
  res.sendfile('templates-common.js');
});

app.get('/templates-app.js', function(req, res){
  res.sendfile('templates-app.js');
});

app.get('/BingSiteAuth.xml', function(req, res){
  res.sendfile('seo/BingSiteAuth.xml');
});

app.get('/bOeAHuseytu27v9K8MznKwOWZFk.html', function(req, res){
  res.sendfile('seo/bOeAHuseytu27v9K8MznKwOWZFk.html');
});

app.get('/google1739f11000682532.html', function(req, res){
  res.sendfile('seo/google1739f11000682532.html');
});

//unsubscribe
app.get('/unsubscribe', function(req, res){
  res.render('unsubscribe', {
    siteUrl : siteURL,
    isProd : isProd,
    apiURL : apiURL,
    mixpanelToken : mixpanelToken
  });
});

//morsel detail with post id/slug
app.get('/:username/:postidslug', function(req, res){
  renderMorselPage(res, req.params.username, req.params.postidslug);
});

//anything else must be a 404 at this point - this will obviously change
app.get('*', function(req, res) {
  res.redirect('/');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
});

function renderAngular(res, mData) {
  var fullMetadata = mData || findMetadata('default');

  res.render('index', {
    metadata: fullMetadata,
    metabase: metabase,
    apiUrl: apiURL,
    isProd : isProd
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

function renderMorselPage(res, username, postIdSlug) {

  request(apiURL+'/users/'+username+apiQuerystring, function (error, response, body) {
    var user;

    if (!error && response.statusCode == 200) {
      user = JSON.parse(body).data;

      request(apiURL+'/posts/'+postIdSlug+apiQuerystring, function (error, response, body) {
        var post,
            postMetadata;

        if (!error && response.statusCode == 200) {
          post = JSON.parse(body).data;

          postMetadata = {
            "title": _.escape(post.title + ' - ' + user.first_name + ' ' + user.last_name + ' | Morsel'),
            "description": _.escape(truncateAt(getFirstDescription(post.morsels), 155)),
            "image": getCoverPhoto(post.morsels, post.primary_morsel_id) || "http://www.eatmorsel.com/assets/images/logos/morsel-large.png",
            "twitter": {
              "card" : "summary_large_image",
              "creator": user.twitter_username || "@eatmorsel"
            },
            "url": siteURL + '/' + user.username + '/' + post.id + '-' + post.slug
          };

          postMetadata.twitter = _.defaults(postMetadata.twitter || {}, metadata.default.twitter);
          postMetadata.og = _.defaults(postMetadata.og || {}, metadata.default.og);
          postMetadata = _.defaults(postMetadata || {}, metadata.default);
         
          renderAngular(res, postMetadata);
        } else {
          //not a valid morsel id - must be a bad route
          render404(res);
        }
      });
    } else {
      //not a valid user - must be a bad route
      render404(res);
    }
  });
}

function getFirstDescription(morsels) {
  return _.find(morsels, function(m) {
    return m.description && m.description.length > 0;
  })['description'];
}

function truncateAt(text, limit) {
  return text.substring(0, limit);
}

function render404(res) {
  res.render('404', {
    metadata: findMetadata('404')
  });
}

function getCoverPhoto(morsels, mId) {
  var primaryMorsel;

  primaryMorsel = _.find(morsels, function(m) {
    return m.id === mId;
  });

  if(primaryMorsel) {
    return primaryMorsel.photos._992x992;
  } else {
    return morsels[0].photos._992x992;
  }
}

function updateMetabase(req, done) {
  //we need to make sure everything renders properly even when it's hosted on s3 or wherever
  metabase = siteURL;
  done();
}