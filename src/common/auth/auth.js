angular.module( 'Morsel.auth', [
  'ngStorage'
] )

.factory('Auth', function($window, ApiUsers, $location, Restangular, $q){
  var Auth = {};
  
  Auth.blankUser = function() { 
    return {
      'id': '',
      'email': null,
      'first_name': null,
      'last_name': null,
      'sign_in_count': null,
      'created_at': null,
      'photo_url': null,
      'title': null,
      'auth_token': '' 
    };
  };

  Auth.currentUser = Auth.blankUser();

  Auth.forgetUser = function() {
    delete $window.localStorage.userId;
    delete $window.localStorage.auth_token;
  };

  Auth.saveUser = function() {
    if(Auth.currentUser.id && Auth.currentUser.auth_token) {
      $window.localStorage.userId = Auth.currentUser.id;
      $window.localStorage.auth_token = Auth.currentUser.auth_token;
    }
  };

  Auth.getSavedUserId = function() {
    return $window.localStorage.userId || null;
  };

  Auth.getSavedUserAuthToken = function() {
    return $window.localStorage.auth_token || null;
  };

  Auth.getCurrentUser = function() {
    return Auth.currentUser;
  };

  Auth.updateUser = function(userData) {
    _.extend(Auth.currentUser, Restangular.stripRestangular(userData));
    Auth.saveUser();
    Auth.resetApiKey();
  };

  Auth.clearUser = function() {
    Auth.updateUser(Auth.blankUser());
    Auth.forgetUser();
  };

  Auth.join = function(userData, success, error) {
    ApiUsers.newUser(userData).then(function(loggedInUser) {
      Auth.updateUser(loggedInUser);
      success();
    }, function(resp){
      Auth.clearUser();
      error(resp);
    });
  };

  Auth.login = function(userData, success, error) {
    ApiUsers.loginUser(userData).then(function(loggedInUser) {
      Auth.updateUser(loggedInUser);
      success();
    }, function(resp){
      Auth.clearUser();
      error(resp);
    });
  };

  Auth.logout = function(userData) {
    Auth.clearUser();
    $location.path('/home');
  };

  Auth.isLoggedIn = function() {
    return Auth.getSavedUserId() && Auth.getSavedUserAuthToken();
  };

  Auth.resetApiKey = function() {
    var savedUserId = Auth.getSavedUserId(),
        storedUserAuthToken = Auth.getSavedUserAuthToken();

    if(savedUserId && storedUserAuthToken) {
      Restangular.setDefaultRequestParams({api_key: savedUserId + ':' + storedUserAuthToken});
    } else {
      Restangular.setDefaultRequestParams();
    }
  };

  Auth.setupInterceptor = function() {
    Restangular.setErrorInterceptor(function(response) {
      if (response.status ===401) {
        Auth.clearUser();
        $location.path('/login');
      }
    });
  };

  return Auth;
});