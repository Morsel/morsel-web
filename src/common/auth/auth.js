angular.module( 'Morsel.auth', [
  'ngStorage'
] )

// Auth is used for all user authentication interactions
.factory('Auth', function($window, ApiUsers, $location, Restangular, $q, $timeout){
  var Auth = {};

  //"private" methods, for my own sanity

  //an anonymous user
  Auth._blankUser = function() { 
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

  //start with an anonymous user
  Auth._resetUser = function() {
    Auth.currentUser = Auth._blankUser();
  };

  //remove user data from storage
  Auth._forgetUser = function() {
    delete $window.localStorage.userId;
    delete $window.localStorage.auth_token;
  };

  //add user data to storage
  Auth._saveUser = function() {
    if(Auth.currentUser.id && Auth.currentUser.auth_token) {
      $window.localStorage.userId = Auth.currentUser.id;
      $window.localStorage.auth_token = Auth.currentUser.auth_token;
    }
  };

  //get userid from storage
  Auth._getSavedUserId = function() {
    return $window.localStorage.userId || null;
  };

  //get userauthtoken from storage
  Auth._getSavedUserAuthToken = function() {
    return $window.localStorage.auth_token || null;
  };

  //update the current user and save her
  Auth._updateUser = function(userData) {
    _.extend(Auth.currentUser, Restangular.stripRestangular(userData));
    Auth._saveUser();
    Auth._resetApiKey();
  };

  //forget the user in our app
  Auth._clearUser = function() {
    Auth._updateUser(Auth._blankUser());
    Auth._forgetUser();
  };

  //adjust the API key for current user
  Auth._resetApiKey = function() {
    var savedUserId = Auth._getSavedUserId(),
        storedUserAuthToken = Auth._getSavedUserAuthToken();

    if(savedUserId && storedUserAuthToken) {
      Restangular.setDefaultRequestParams({
        device: 'web',
        api_key: savedUserId + ':' + storedUserAuthToken
      });
    } else {
      Restangular.setDefaultRequestParams({
        device: 'web'
      });
    }
  };

  //public stuff

  //create a new user
  Auth.join = function(userData, success, error) {
    ApiUsers.newUser(userData).then(function(loggedInUser) {
      Auth._updateUser(loggedInUser);
      success();
    }, function(resp){
      Auth._clearUser();
      error(resp);
    });
  };

  //log in an existing user
  Auth.login = function(userData, success, error) {
    ApiUsers.loginUser(userData).then(function(loggedInUser) {
      Auth._updateUser(loggedInUser);
      success();
    }, function(resp){
      Auth._clearUser();
      error(resp);
    });
  };

  //log out a user
  Auth.logout = function(userData) {
    Auth._clearUser();
    $location.path('/home');
  };

  //check if a user is logged in
  Auth.isLoggedIn = function() {
    return Auth._getSavedUserId() && Auth._getSavedUserAuthToken();
  };

  //intercept our API calls
  Auth.setupInterceptor = function() {
    Restangular.setErrorInterceptor(function(response) {
      //if an API call is ever blocked by restricted access, we log the user out for security
      if (response.status === 401) {
        Auth._clearUser();
        $location.path('/login');
      }
    });
  };

  //return a promise about data for our current user
  Auth.getUserData = function() {
    var deferred = $q.defer(),
        savedUserId = Auth._getSavedUserId();

    //if we have a currentUser in our app
    if(Auth.currentUser && Auth.currentUser.id && Auth.currentUser.auth_token) {
      //return her
      $timeout(function(){deferred.resolve(Auth.currentUser);}, 0);
    } else if(savedUserId) {
      //if there's a user id saved
      //reset our key
      Auth._resetApiKey();
      //get the rest of the users data from the server
      ApiUsers.getUserData(savedUserId).then(function(loggedInUser) {
        //update the app's user
        Auth._updateUser(loggedInUser);
        deferred.resolve(Auth.currentUser);
      }, function() {
        //oops. must have been a faulty user. go anonymous for now
        Auth._clearUser();
        deferred.resolve(Auth.currentUser);
      });
    } else {
      //they're anonymous
      Auth._resetUser();
      $timeout(function(){deferred.resolve(Auth.currentUser);}, 0);
    }

    return deferred.promise;
  };

  //to start, reset our user
  Auth._resetUser();

  return Auth;
});