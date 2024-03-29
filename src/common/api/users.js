angular.module( 'Morsel.common.apiUsers', [] )

// ApiUsers is the middleman for dealing with /users requests
.factory('ApiUsers', function($http, Restangular, $q, ApiUploads) {
  var Users = {},
      RestangularUsers = Restangular.all('users');

  Users.getUser = function(usernameOrId) {
    var deferred = $q.defer();

    RestangularUsers.get(usernameOrId).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
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
      ApiUploads.postUpload(Restangular.one('users'), fd).then(function(resp){
        deferred.resolve(Restangular.stripRestangular(resp));
      }, function(resp){
        deferred.reject(Restangular.stripRestangular(resp));
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
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getMorsels = function(userId, morselsParams) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('morsels').get(morselsParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.updateUser = function(userId, userData) {
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

      //use our restangular multi-part post
      ApiUploads.putUpload(Restangular.one('users', userId), fd).then(function(resp){
        deferred.resolve(Restangular.stripRestangular(resp));
      }, function(resp){
        deferred.reject(Restangular.stripRestangular(resp));
      });
    } else {
      //no photo - use normal PUT
      Restangular.one('users', userId).customPUT(userData).then(function(resp) {
        deferred.resolve(Restangular.stripRestangular(resp));
      }, function(resp) {
        deferred.reject(Restangular.stripRestangular(resp));
      });
    }

    return deferred.promise;
  };

  Users.updateIndustry = function(userId, industry) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('updateindustry', 0, true).customPUT({user:{industry:industry}}).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
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

  Users.getFollowers = function(userId, followersParams) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('followers').get(followersParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getFollowables = function(userId, followablesParams) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('followables').get(followablesParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getLikeables = function(userId, type) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('likeables').get({type: type}).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.checkAuthentication = function(provider, userProviderId) {
    var deferred = $q.defer(),
        params  = {
          'authentication[provider]': provider,
          'authentication[uid]': userProviderId
        };

    Restangular.one('authentications', 0, true).customGET('check', params).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.validateEmail = function(email) {
    var deferred = $q.defer();

    RestangularUsers.customGET('validate_email', {email: email}).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getAuthentications = function() {
    var deferred = $q.defer();

    Restangular.one('authentications').get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.createAuthentication = function(authenticationData) {
    var deferred = $q.defer();

    Restangular.all('authentications').post(authenticationData).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.updateAuthentication = function(authenticationId, authenticationData) {
    var deferred = $q.defer();

    Restangular.one('authentications', authenticationId).customPUT(authenticationData).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.deleteAuthentication = function(authenticationId) {
    var deferred = $q.defer();

    Restangular.one('authentications', authenticationId).remove().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.AuthenticationConnects = function(provider, uids) {
    var deferred = $q.defer();

    Restangular.one('authentications', 0, true).post('connections', {
      provider : provider,
      uids: uids
    }).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.forgotPassword = function(email) {
    var deferred = $q.defer();

    Restangular.one('users', 0, true).post('forgot_password', email).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.resetPassword = function(passwordData) {
    var deferred = $q.defer();

    Restangular.one('users', 0, true).post('reset_password', passwordData).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getActivities = function(activitiesParams) {
    var deferred = $q.defer();

    RestangularUsers.one('activities').get(activitiesParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getFollowablesActivities = function(followablesActivitiesParams) {
    var deferred = $q.defer();

    RestangularUsers.one('followables_activities').get(followablesActivitiesParams).then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getNotifications = function() {
    var deferred = $q.defer();

    RestangularUsers.get('notifications').then(function(resp){
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp){
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.search = function(searchUser) {
    var deferred = $q.defer();

    Restangular.one('users', 0, true).customGET('search', searchUser).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getPlaces = function(userId) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('places').get().then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  Users.getCollections = function(userId, collectionsParams) {
    var deferred = $q.defer();

    Restangular.one('users', userId).one('collections').get(collectionsParams).then(function(resp) {
      deferred.resolve(Restangular.stripRestangular(resp));
    }, function(resp) {
      deferred.reject(Restangular.stripRestangular(resp));
    });

    return deferred.promise;
  };

  return Users;
});