var express = require("express"),
    mustacheExpress = require('mustache-express'),
    _ = require('underscore'),
    routes = require('./data/routes.json'),
    request = require('request'),
    metadata = require('./data/metadata.json'),
    nodeEnv = process.env.NODE_ENV || 'development',
    isProd = nodeEnv === 'production',
    siteURL = process.env.SITEURL || 'localhost:5000',
    apiURL = 'http://api.eatmorsel.com', //process.env.APIURL || 'http://api-staging.eatmorsel.com',
    apiQuerystring = '.json?client%5Bdevice%5D=webserver&client%5Bversion%5D=<%= version %>',
    devMixpanelToken = 'fc91c2a6f8d8388f077f6b9618e90499',
    mixpanelToken = process.env.MIXPANELTOKEN || devMixpanelToken,
    metabase = '/',
    app = express();

//if something goes wrong, exit so heroku can try to restart
process.on('uncaughtException', function (err) {
  console.error('uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

//log any errors
app.on('error', function (err) {
  console.error(err);
});

app.engine('mustache', mustacheExpress());

app.configure(function(){
  //enable gzip
  app.use(express.compress());
  
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

      request(apiURL+'/morsels/'+postIdSlug+apiQuerystring, function (error, response, body) {
        var post,
            postMetadata,
            description;

        if (!error && response.statusCode == 200) {
          post = JSON.parse(body).data;

          postMetadata = {
            "title": _.escape(post.title + ' - ' + user.first_name + ' ' + user.last_name + ' | Morsel'),
            "image": getMetadataImage(post) || 'http://www.eatmorsel.com/assets/images/logos/morsel-large.png',
            "twitter": {
              "card" : 'summary_large_image',
              "creator": user.twitter_username || '@eatmorsel'
            },
            "url": siteURL + '/' + user.username + '/' + post.id + '-' + post.slug
          };

          description = _.escape(truncateAt(getFirstDescription(post.items), 155));
          //there's a change none of the morsels have a description
          if(description) {
            postMetadata.description = description;
          }

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
  var firstMorselWithDescription;

  firstMorselWithDescription = _.find(morsels, function(m) {
    return m.description && m.description.length > 0;
  });

  if(firstMorselWithDescription) {
    return firstMorselWithDescription.description;
  } else {
    return '';
  }
}

function truncateAt(text, limit) {
  return text.substring(0, limit);
}

function render404(res) {
  res.render('404', {
    metadata: findMetadata('404')
  });
}

function getMetadataImage(morsel) {
  var primaryItem;

  //if they have a collage, use it
  if(morsel.photos) {
    return morsel.photos._400x300;
  } else {
    //use their cover photo as backup
    primaryItem = _.find(morsel.items, function(i) {
      return i.id === morsel.primary_item_id;
    });

    if(primaryItem && primaryItem.photos) {
      return primaryItem.photos._992x992;
    } else {
      return morsels[0].photos._992x992;
    }
  }
}

function updateMetabase(req, done) {
  //we need to make sure everything renders properly even when it's hosted on s3 or wherever
  metabase = siteURL;
  done();
}