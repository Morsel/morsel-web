angular.module( 'Morsel.userData', [] )

.service('userData', function(Restangular, $q, Auth, ApiUsers, $timeout) {
  var deferred = $q.defer(),
      savedUserId = Auth.getSavedUserId();

  if(Auth.currentUser && Auth.currentUser.id && Auth.currentUser.auth_token) {
    $timeout(function(){deferred.resolve(Auth.currentUser);}, 0);
  } else if(savedUserId) {
    Auth.resetApiKey();
    ApiUsers.getUserData(savedUserId).then(function(loggedInUser) {
      Auth.updateUser(loggedInUser);
      deferred.resolve(Auth.currentUser);
    }, function() {
      Auth.clearUser();
      deferred.resolve(Auth.currentUser);
    });
  } else {
    Auth.currentUser = Auth.blankUser();
    $timeout(function(){deferred.resolve(Auth.currentUser);}, 0);
  }

  return deferred.promise;
});