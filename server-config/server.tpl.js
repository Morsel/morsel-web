var express = require("express"),
    mustacheExpress = require('mustache-express'),
    _ = require('underscore'),
    oauth = require('oauth'),
    sys = require('util'),
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
    twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY || '12345';
    twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET || '12345';
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

  app.use(express.cookieParser());
  app.use(express.session({secret: 'THESESESSIONSARENOTSECURE'}));

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
  renderPublicPage(res, findMetadata(''));
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

app.get('/templates-static.js', function(req, res){
  res.sendfile('templates-static.js');
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

app.get('/pinterest-98fe2.html', function(req, res){
  res.sendfile('seo/pinterest-98fe2.html');
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

//password reset
app.get('/password-reset', function(req, res){
  renderLoginPage(res);
});

//password reset
app.get('/password-reset/new', function(req, res){
  renderLoginPage(res);
});

//account pages
app.get('/account*', function(req, res){
  var fullMetadata = findMetadata('default');

  res.render('account', {
    metadata: fullMetadata,
    metabase: metabase,
    siteUrl : siteURL,
    isProd : isProd,
    apiUrl : apiUrl,
    mixpanelToken : mixpanelToken,
    //determine how to render menu
    pageType: {
      account: true
    }
  });
});

//feed
app.get('/feed', function(req, res){
  renderPublicPage(res);
});

//activity
app.get('/activity', function(req, res){
  renderPublicPage(res);
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

//twitter auth
app.get('/auth/twitter/connect', function(req, res){
  console.log('got route');
  getTwitterOAuthRequestToken(res, req);
});

app.get('/auth/twitter/callback', function(req, res){
  getTwitterOAuthAccessToken(res, req);
});

//anything else must be a 404 at this point - this will obviously change
app.get('*', function(req, res) {
  render404(res);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

function renderPublicPage(res, mData) {
  var fullMetadata = mData || findMetadata('default');

  res.render('public', {
    metadata: fullMetadata,
    metabase: metabase,
    apiUrl: apiUrl,
    isProd : isProd,
    mixpanelToken : mixpanelToken,
    //determine how to render menu
    pageType: {
      public: true
    }
  });
}

function renderStatic(res, route) {
  var fullMetadata = findMetadata(route) || findMetadata('default'),
      templateVars = {
        metadata: fullMetadata,
        metabase: metabase,
        apiUrl: apiUrl,
        isProd : isProd,
        mixpanelToken : mixpanelToken,
        staticPartial: {},
        //determine how to render menu
        pageType: {
          static: true
        }
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

      renderPublicPage(res, userMetadata);
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
         
          renderPublicPage(res, morselMetadata);
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

function renderLoginPage(res, twitterData) {
  var fullMetadata = findMetadata('login');

  res.render('login', {
    metadata: fullMetadata,
    siteUrl : siteURL,
    metabase: metabase,
    isProd : isProd,
    apiUrl : apiUrl,
    mixpanelToken : mixpanelToken,
    facebookAppId : facebookAppId,
    twitterData : JSON.stringify(twitterData) || 'null'
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
  res.status(404).render('404', {
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

//twitter auth 
function twitterConsumer() {
  return new oauth.OAuth(
    'https://api.twitter.com/oauth/request_token', 
    'https://api.twitter.com/oauth/access_token', 
     twitterConsumerKey, 
     twitterConsumerSecret, 
     "1.0A", 
     siteURL+'/auth/twitter/callback', 
     "HMAC-SHA1"
   );
}

function getTwitterOAuthRequestToken(res, req) {
  twitterConsumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {

    console.log('got oauth reqest token');
    if (error) {
      sys.puts('got error',  sys.inspect(error));
      renderLoginPage(res, {
        errors: {
          base: [
            'There was a problem logging into Twitter'
          ]
        }
      });
    } else {
       console.log('got without error');
      //remember where the user was headed
      if(req.query.next) {
        console.log('req.quest.next');
        req.session.loginNext = req.query.next;
      }
      console.log('after  req.quest.next');
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token="+oauthToken);
    }
  });
}

function getTwitterOAuthAccessToken(res, req) {
  twitterConsumer().getOAuthAccessToken(
    req.session.oauthRequestToken, 
    req.session.oauthRequestTokenSecret, 
    req.query.oauth_verifier, 
    function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    if (error) {
      renderLoginPage(res, {
        errors: {
          base: [
            'There was a problem logging into Twitter'
          ]
        }
      });
    } else {
      req.session.oauthAccessToken = oauthAccessToken;
      req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
      twitterConsumer().get("https://api.twitter.com/1.1/account/verify_credentials.json",
        req.session.oauthAccessToken,
        req.session.oauthAccessTokenSecret,
        function (error, data, response) {
        if (error) {
          renderLoginPage(res, {
            errors: {
              base: [
                'There was a problem logging into Twitter'
              ]
            }
          });
        } else {
          var tData = JSON.parse(data);

          //add our token and secret
          tData.userData = {
            token: req.session.oauthAccessToken,
            secret: req.session.oauthAccessTokenSecret
          };

          if(req.session.loginNext) {
            tData.loginNext = req.session.loginNext;
          }

          renderLoginPage(res, tData);
        }
      });
    }
  });
}