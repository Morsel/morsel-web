var express = require("express"),
    mustacheExpress = require('mustache-express'),
    _ = require('underscore'),
    staticRoutes = require('./data/static-routes.json'),
    request = require('request'),
    metadata = require('./data/metadata.json'),
    nodeEnv = process.env.NODE_ENV || 'development',
    isProd = nodeEnv === 'production',
    siteURL = process.env.SITEURL || 'localhost:5000',
    apiUrl = process.env.apiUrl || 'http://api-staging.eatmorsel.com',
    apiQuerystring = '.json?client%5Bdevice%5D=webserver&client%5Bversion%5D=<%= version %>',
    devMixpanelToken = 'fc91c2a6f8d8388f077f6b9618e90499',
    mixpanelToken = process.env.MIXPANELTOKEN || devMixpanelToken,
    prerender,
    prerenderDevUrl = 'http://morsel-seo.herokuapp.com/',
    prerenderToken = process.env.PRERENDER_TOKEN || '',
    facebookAppId = process.env.FACEBOOK_APP_ID || '1406459019603393',
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

  /*prerender = require('prerender-node').set('prerenderServiceUrl', prerenderDevUrl).set('beforeRender', updateMetabase).set('afterRender', function(req, prerender_res) {
    console.log('req is:');
    console.log(req);
    console.log('prerender_res is:');
    console.log(prerender_res);
    console.log('using prerender server');
  });
  
  if(currEnv === 'production' && prerenderToken) {
    prerender = require('prerender-node').set('prerenderToken', prerenderToken).set('beforeRender', updateMetabase);
  } else {
    prerender = require('prerender-node').set('prerenderServiceUrl', prerenderDevUrl).set('beforeRender', updateMetabase);
  }
  app.use(prerender);
  */
  app.use(app.router);
});

app.get('/', function(req, res) {
  renderAngular(res, findMetadata(''));
});

/* from dev-launch
app.get('/', function(req, res) {
  res.render('claim', {
    siteUrl : siteURL,
    isProd : isProd,
    apiUrl : apiUrl,
    mixpanelToken : mixpanelToken
  });
});
*/

//templates
app.get('/templates-public.js', function(req, res){
  res.sendfile('templates-public.js');
});

app.get('/templates-account.js', function(req, res){
  res.sendfile('templates-account.js');
});

app.get('/templates-login.js', function(req, res){
  res.sendfile('templates-login.js');
});

//SEO
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
    apiUrl : apiUrl,
    mixpanelToken : mixpanelToken
  });
});

//login
app.get('/login', function(req, res){
  renderLoginPage(res);
});

//logout
app.get('/logout', function(req, res){
  renderLoginPage(res);
});

//join
app.get('/join/:step', function(req, res){
  renderLoginPage(res);
});

app.get('/join', function(req, res){
  renderLoginPage(res);
});

//account pages
app.get('/account*', function(req, res){
  res.render('account', {
    siteUrl : siteURL,
    isProd : isProd,
    apiUrl : apiUrl,
    mixpanelToken : mixpanelToken
  });
});

//morsel detail with post id/slug
app.get('/:username/:postidslug', function(req, res){
  renderMorselPage(res, req.params.username, req.params.postidslug);
});

//anything with a single route param
app.get('/:route', function(req, res, next){
  var route = req.params.route;

  //check against our known routes
  if(isStaticRoute(route)) {
    renderStatic(res, route);
  } else {
    //check and see if it's a reserved route
    request(apiUrl+'/configuration'+apiQuerystring, function (error, response, body) {
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
            renderUserPage(res, route);
          } else {
            //not sure what this could be, send it to next route
            next();
          }
        }
      }
    });
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

  res.render('public', {
    metadata: fullMetadata,
    metabase: metabase,
    apiUrl: apiUrl,
    isProd : isProd,
    mixpanelToken : mixpanelToken
  });
}

function renderStatic(res, route) {
  var fullMetadata = findMetadata(route) || findMetadata('default'),
      templateVars = {
        metadata: fullMetadata,
        apiUrl: apiUrl,
        isProd : isProd,
        mixpanelToken : mixpanelToken,
        staticPartial: {}
      };

  //set a var here to let our static template render off it
  templateVars.staticPartial[route] = true;

  res.render('static', templateVars);
}

function isStaticRoute(route) {
  return _.find(staticRoutes, function(staticRoute) {
    return staticRoute === route;
  });
}

function findMetadata(route) {
  var mdata = _.find(metadata, function(r, ind) {
    return ind === route;
  });

  return _.defaults(mdata || {}, metadata.default);
}

function renderUserPage(res, username) {  
  request(apiUrl+'/users/'+username+apiQuerystring, function (error, response, body) {
    var user,
        userImage,
        userMetadata;

    if (!error && response.statusCode == 200) {
      user = JSON.parse(body).data;
      userImage = user.photos && user.photos._144x144;

      userMetadata = {
        "title": _.escape(user.first_name + ' ' + user.last_name + ' (' + user.username + ') | Morsel'),
        "description": _.escape(user.first_name + ' ' + user.last_name + (user.bio ? ' - ' + user.bio : '')),
        "image": userImage || "http://www.eatmorsel.com/assets/images/logos/morsel-large.png",
        "twitter": {
          "creator": '@'+(user.twitter_username || 'eatmorsel')
        },
        "url": siteURL + '/' + user.username
      };

      userMetadata.twitter = _.defaults(userMetadata.twitter || {}, metadata.default.twitter);
      userMetadata.og = _.defaults(userMetadata.og || {}, metadata.default.og);
      userMetadata = _.defaults(userMetadata || {}, metadata.default);

      renderAngular(res, userMetadata);
    } else {
      //not a valid user - must be a bad route
      render404(res);
    }
  });
}

function renderMorselPage(res, username, morselIdSlug) {
  request(apiUrl+'/users/'+username+apiQuerystring, function (error, response, body) {
    var user;

    if (!error && response.statusCode == 200) {
      user = JSON.parse(body).data;

      request(apiUrl+'/morsels/'+morselIdSlug+apiQuerystring, function (error, response, body) {
        var morsel,
            morselMetadata,
            description;

        if (!error && response.statusCode == 200) {
          morsel = JSON.parse(body).data;

          morselMetadata = {
            "title": _.escape(morsel.title + ' - ' + user.first_name + ' ' + user.last_name + ' | Morsel'),
            "image": getMetadataImage(morsel) || 'http://www.eatmorsel.com/assets/images/logos/morsel-large.png',
            "twitter": {
              "card" : 'summary_large_image',
              "creator": '@'+(user.twitter_username || 'eatmorsel')
            },
            "og": {
              "type":"article",
              "article_publisher": "https://www.facebook.com/eatmorsel",
              "article_published_at":morsel.published_at,
              "article_modified_at":morsel.updated_at,
              "is_article": true
            },
            "url": siteURL + '/' + user.username + '/' + morsel.id + '-' + morsel.slug
          };

          description = _.escape(truncateAt(getFirstDescription(morsel.items), 155)) + '...';
          //there's a change none of the morsels have a description
          if(description) {
            morselMetadata.description = description;
          }

          //only include fb id if we have one
          if(morsel.facebook_uid) {
            morselMetadata.og.author = morsel.facebook_uid;
          }

          morselMetadata.twitter = _.defaults(morselMetadata.twitter || {}, metadata.default.twitter);
          morselMetadata.og = _.defaults(morselMetadata.og || {}, metadata.default.og);
          morselMetadata = _.defaults(morselMetadata || {}, metadata.default);
         
          renderAngular(res, morselMetadata);
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

function renderLoginPage(res) {
  res.render('login', {
    siteUrl : siteURL,
    isProd : isProd,
    apiUrl : apiUrl,
    mixpanelToken : mixpanelToken,
    facebookAppId : facebookAppId
  });
}

function getFirstDescription(items) {
  var firstItemWithDescription;

  firstItemWithDescription = _.find(items, function(m) {
    return m.description && m.description.length > 0;
  });

  if(firstItemWithDescription) {
    return firstItemWithDescription.description;
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
    if(morsel.photos._800x600) {
      return morsel.photos._800x600;
    } else {
      return morsel.photos._400x300;
    }
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