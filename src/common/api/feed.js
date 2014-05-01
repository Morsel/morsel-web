angular.module( 'Morsel.common.apiFeed', [] )

// ApiFeed is the middleman for dealing with /feed requests
.factory('ApiFeed', function($http, Restangular, $q) {
  var Feed = {};

  Feed.getFeed = function() {
    return Restangular.one('feed').get();
  };

  return Feed;
});