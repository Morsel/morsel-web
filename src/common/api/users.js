angular.module( 'Morsel.common.apiUsers', [] )

// ApiUsers is the middleman for dealing with /users requests
.factory('ApiUsers', function($http, Restangular, $q, ApiUploads) {
  var Users = {},
      RestangularUsers = Restangular.all('users');

  Users.getUser = function(username) {
    var deferred = $q.defer();

    RestangularUsers.get(username).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.newUser = function(userData) {
    var deferred = $q.defer(),
        fd,
        k;

    //if user has a photo, need to use a multi-part request
    if(userData.user.photo) {
      //create a new formdata object to hold all our data
      fd = new FormData();

      //loop through our data and append to fd
      for(k in userData.user) {
        if(userData.user[k]) {
          fd.append('user['+k+']', userData.user[k]);
        }
      }

      if(userData.authentication) {
        //loop through our data and append to fd
        for(k in userData.authentication) {
          if(userData.authentication[k]) {
            fd.append('authentication['+k+']', userData.authentication[k]);
          }
        }
      }

      //use our restangular multi-part post
      ApiUploads.upload('users', fd).then(function(resp){
        deferred.resolve(Restangular.stripRestangular(resp));
      }, function(resp){
        deferred.resolve(Restangular.stripRestangular(resp));
      });
    } else {
      //no photo - use normal restangular post
      RestangularUsers.post(angular.toJson(userData)).then(function(resp){
        deferred.resolve(Restangular.stripRestangular(resp));
      }, function(resp){
        deferred.reject(Restangular.stripRestangular(resp));
      });
    }

    return deferred.promise;
  };

  Users.loginUser = function(userData) {
    var deferred = $q.defer();

    Restangular.one('users').post('sign_in', angular.toJson(userData)).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  //called on initial app load if we have user info in storage
  Users.getMyData = function() {
    var deferred = $q.defer();

    RestangularUsers.get('me').then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getMorsels = function(username) {
    var deferred = $q.defer();

    Restangular.one('users', username).one('morsels').get().then(function(resp) {
      var morselsData = Restangular.stripRestangular(resp);
      //correctly sort morsels by published_at before we even deal with them
      morselsData = _.sortBy(morselsData, 'published_at');
      deferred.resolve(morselsData);
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.updateUser = function(userId, userData) {
    var deferred = $q.defer();

    Restangular.one('users', userId).customPUT(userData).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.updateIndustry = function(userId, industry) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('updateindustry', 0, true).customPUT({user:{industry:industry}}).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.followUser = function(userId) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('follow').post().then(function(resp){
      deferred.resolve(true);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Users.unfollowUser = function(userId) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('follow').remove().then(function(resp){
      deferred.resolve(true);
    }, function(resp) {
      deferred.reject();
    });

    return deferred.promise;
  };

  Users.getFollowers = function(userId) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('followers').get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getFollowables = function(userId, type) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('followables').get({type: type}).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getCuisines = function(userId) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('cuisines').get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getSpecialties = function(userId) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('specialties').get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getLikeables = function(userId, type) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('likeables').get({type: type}).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.checkAuthentication = function(provider, userProviderId) {
    var deferred = $q.defer(),
        params  = {
          'authentication[provider]': provider,
          'authentication[uid]': userProviderId
        };

    //RestangularUsers.get('me').then(function(resp){
    RestangularUsers.one('check_authentication', 0, true).get(params).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Users;
});