var util = require('./../../util');
var sys = require('util');

//twitter auth 
function twitterConsumer() {
  var app = require('./../../server'),
      oauth = require('oauth');

  return new oauth.OAuth(
    'https://api.twitter.com/oauth/request_token', 
    'https://api.twitter.com/oauth/access_token', 
     util.twitterConsumerKey, 
     util.twitterConsumerSecret, 
     "1.0A", 
     app.locals.siteUrl+'/auth/twitter/callback', 
     "HMAC-SHA1"
  );
}

function renderLoginPage(res, twitterData) {
  util.updateMetadata('login');

  res.render('login', {
    facebookAppId : util.facebookAppId,
    twitterData : JSON.stringify(twitterData) || 'null',
    metabase: '/auth'
  });
};

module.exports.renderLoginPage = renderLoginPage;

module.exports.getTwitterOAuthRequestToken = function(req, res) {
  twitterConsumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {

    if (error) {
      renderLoginPage(res, {
        errors: {
          base: [
            'There was a problem logging into Twitter'
          ]
        }
      });
    } else {
      //remember where the user was headed
      if(req.query.next) {
        req.session.loginNext = req.query.next;
      }

      //did user come from adding a social account?
      if(req.query.social) {
        req.session.social = true;
      }
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token="+oauthToken);
    }
  });
};

module.exports.getTwitterOAuthAccessToken = function(req, res) {
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

          //check if we're trying to add a social account
          if(req.session.social) {
            req.session.tData = tData;
            res.redirect(301, '/account/social-accounts');
          } else {
            renderLoginPage(res, tData);
          }
        }
      });
    }
  });
};