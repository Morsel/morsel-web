var util = require('./../../util');
var _ = require('underscore');

function getCoverPhoto(morsel) {
  var primaryItemPhotos = findPrimaryItemPhotos(morsel),
      lastItemWithPhotos;

  //use their cover photo if there is one
  if(primaryItemPhotos) {
    return primaryItemPhotos._992x992;
  } else {
    lastItemWithPhotos = findLastItemWithPhotos(morsel.items);
    return lastItemWithPhotos ? lastItemWithPhotos._992x992 : 'https://www.eatmorsel.com/assets/images/logos/morsel-large.png';
  }
}

function getCollage(morsel) {
  return morsel.photos ? morsel.photos._800x600 : getCoverPhoto(morsel);
}

function findPrimaryItemPhotos(morsel) {
  var primaryItem = _.find(morsel.items, function(i) {
    return i.id === morsel.primary_item_id;
  });

  if(primaryItem && primaryItem.photos) {
    return primaryItem.photos;
  } else {
    return null;
  }
}

function findLastItemWithPhotos(items) {
  var reverseItems = items.slice(0);

  return _.find(reverseItems, function(i) {
    return i.photos;
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

function renderPublicPage(res, customMetadata) {
  var app = require('./../../server');

  if(customMetadata) {
    res.locals.metadata = customMetadata;
  }

  res.render('public', {
    facebookAppId : util.facebookAppId,
    pageType: {
      public: true
    },
    metabase: '/',
    showAppBanner: true
  });
}

module.exports.renderPublicPage = renderPublicPage;

module.exports.renderMorselPage = function(req, res) {
  var app = require('./../../server'),
      username = req.params.username,
      morselIdSlug = req.params.postidslug,
      request = require('request');

  request(app.locals.apiUrl+'/users/'+username+util.apiQuerystring, function (error, response, body) {
    var user;

    if (!error && response.statusCode == 200) {
      user = JSON.parse(body).data;

      request(app.locals.apiUrl+'/morsels/'+morselIdSlug+util.apiQuerystring, function (error, response, body) {
        var morsel,
            morselMetadata,
            description;

        if (!error && response.statusCode == 200) {
          morsel = JSON.parse(body).data;

          morselMetadata = {
            "title": _.escape(morsel.title + ' - ' + user.first_name + ' ' + user.last_name + ' | Morsel'),
            "image": getCoverPhoto(morsel),
            "twitter": {
              "card" : 'summary_large_image',
              "creator": '@'+(user.twitter_username || 'eatmorsel'),
              "image": getCollage(morsel)
            },
            "og": {
              "type":"article",
              "article_publisher": "https://www.facebook.com/eatmorsel",
              "article_published_at":morsel.published_at,
              "article_modified_at":morsel.updated_at,
              "is_article": true
            },
            "url": app.locals.siteUrl + '/' + user.username.toLowerCase() + '/' + morsel.id + '-' + morsel.slug
          };

          description = _.escape(util.truncateAt(getFirstDescription(morsel.items), 155)) + '...';
          //there's a change none of the morsels have a description
          if(description) {
            morselMetadata.description = description;
          }

          //only include fb id if we have one
          if(morsel.facebook_uid) {
            morselMetadata.og.author = morsel.facebook_uid;
          }

          morselMetadata.twitter = _.defaults(morselMetadata.twitter || {}, util.defaultMetadata.twitter);
          morselMetadata.og = _.defaults(morselMetadata.og || {}, util.defaultMetadata.og);
          morselMetadata = _.defaults(morselMetadata || {}, util.defaultMetadata);

          renderPublicPage(res, morselMetadata);
        } else {
          //not a valid morsel id - must be a bad route
          util.render404(res);
        }
      });
    } else {
      //not a valid user - must be a bad route
      util.render404(res);
    }
  });
};

module.exports.renderUserPage = function(res, userIdOrUsername) {
  var request = require('request'),
      app = require('./../../server');

  request(app.locals.apiUrl+'/users/'+userIdOrUsername+util.apiQuerystring, function (error, response, body) {
    var user,
        userImage,
        userMetadata;

    if (!error && response.statusCode == 200) {

      user = JSON.parse(body).data;
      userImage = user.photos && user.photos._144x144;

      userMetadata = {
        "title": _.escape(user.first_name + ' ' + user.last_name + ' (' + user.username + ') | Morsel'),
        "description": _.escape(user.first_name + ' ' + user.last_name + (user.bio ? ' - ' + user.bio : '')),
        "image": userImage || "https://www.eatmorsel.com/assets/images/logos/morsel-large.png",
        "twitter": {
          "creator": '@'+(user.twitter_username || 'eatmorsel')
        },
        "url": app.locals.siteUrl + '/' + user.username.toLowerCase()
      };

      userMetadata.twitter = _.defaults(userMetadata.twitter || {}, util.defaultMetadata.twitter);
      userMetadata.og = _.defaults(userMetadata.og || {}, util.defaultMetadata.og);
      userMetadata = _.defaults(userMetadata || {}, util.defaultMetadata);

      renderPublicPage(res, userMetadata);
    } else {
      //not a valid user - must be a bad route
      util.render404(res);
    }
  });
};

module.exports.renderPlacePage = function(res, placeIdSlug) {
  var request = require('request'),
      app = require('./../../server');

  request(app.locals.apiUrl+'/places/'+placeIdSlug+util.apiQuerystring, function (error, response, body) {
    var place,
        placeMetadata,
        placeTitle,
        placeDescription;

    if (!error && response.statusCode == 200) {

      place = JSON.parse(body).data;

      placeTitle = place.name;
      placeDescription = 'Learn more about '+place.name+' and the people, inspirations, dishes and drinks';

      if(place.city) {
        placeTitle+=', '+place.city;
        placeDescription+=' in '+place.city;
      }

      if(place.state) {
        placeTitle+=', '+place.state;
        placeDescription+=', '+place.state;
      }

      placeMetadata = {
        "title": _.escape( placeTitle+ ' Inspirations, Dishes & Drinks | Morsel'),
        "description": _.escape(placeDescription+' | Morsel'),
        "image": "https://www.eatmorsel.com/assets/images/logos/morsel-large.png",
        "twitter": {
          "creator": '@'+(place.twitter_username || 'eatmorsel')
        },
        "url": app.locals.siteUrl + '/places/' + place.id + '-' + place.slug.toLowerCase()
      };

      placeMetadata.twitter = _.defaults(placeMetadata.twitter || {}, util.defaultMetadata.twitter);
      placeMetadata.og = _.defaults(placeMetadata.og || {}, util.defaultMetadata.og);
      placeMetadata = _.defaults(placeMetadata || {}, util.defaultMetadata);

      renderPublicPage(res, placeMetadata);
    } else {
      //not a valid user - must be a bad route
      util.render404(res);
    }
  });
};