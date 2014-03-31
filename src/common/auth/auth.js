angular.module( 'Morsel.auth', [
  'ngStorage'
] )

// Auth is used for all user authentication interactions
.factory('Auth', function($window, ApiUsers, $location, Restangular, $q, $timeout, DEVICEKEY, DEVICEVALUE, VERSIONKEY, VERSIONVALUE){
  var Auth = {},
      defaultRequestParams = {},
      hasLoadedUser = $q.defer();

  //our fallback
  defaultRequestParams[DEVICEKEY] = DEVICEVALUE;
  defaultRequestParams[VERSIONKEY] = VERSIONVALUE;

  //"private" methods, for my own sanity

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
      'auth_token': '',
      'username': null,
      'industry': null
    };
  };

  //start with an anonymous user
  Auth._resetUser = function() {
    Auth._currentUser = Auth._blankUser();
  };

  //remove user data from storage
  Auth._forgetUser = function() {
    delete $window.localStorage.userId;
    delete $window.localStorage.auth_token;

    Auth._resetApiKey();
  };

  //add user data to storage
  Auth._saveUser = function() {
    if(Auth._currentUser.id && Auth._currentUser.auth_token) {
      $window.localStorage.userId = Auth._currentUser.id;
      $window.localStorage.auth_token = Auth._currentUser.auth_token;
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
    _.extend(Auth._currentUser, Restangular.stripRestangular(userData));
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
        storedUserAuthToken = Auth._getSavedUserAuthToken(),
        requestParams = _.clone(defaultRequestParams);

    if(savedUserId && storedUserAuthToken) {
      requestParams['api_key'] = savedUserId + ':' + storedUserAuthToken;

      Restangular.setDefaultRequestParams(requestParams);
    } else {
      Auth.resetAPIParams();
    }
  };

  //public stuff

  //create a new user
  Auth.join = function(uploadUserData, onSuccess, onError) {
    ApiUsers.newUser(uploadUserData).then(function(loggedInUser) {
      Auth._updateUser(loggedInUser);
      onSuccess();
    }, function(resp){
      Auth._clearUser();
      onError(resp);
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

  //check user industry type
  Auth.isChef = function() {
    return Auth.isLoggedIn() && (Auth._currentUser.industry === 'chef');
  };

  Auth.isMedia = function() {
    return Auth.isLoggedIn() && (Auth._currentUser.industry === 'media');
  };

  Auth.isDiner = function() {
    return Auth.isLoggedIn() && (Auth._currentUser.industry === 'diner');
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

  //Reset API params to the default
  Auth.resetAPIParams = function() {
    Restangular.setDefaultRequestParams(defaultRequestParams);
  };

  //return a promise about data for our current user
  Auth.setInitialUserData = function() {
    var savedUserId = Auth._getSavedUserId();

    //if we have a currentUser in our app
    if(Auth._currentUser && Auth._currentUser.id && Auth._currentUser.auth_token) {
      //return her
      $timeout(function(){hasLoadedUser.resolve(Auth._currentUser);}, 0);
    } else if(savedUserId) {
      //if there's a user id saved
      //reset our key
      Auth._resetApiKey();
      //get the rest of the users data from the server
      ApiUsers.getMyData().then(function(loggedInUser) {
        //update the app's user
        Auth._updateUser(loggedInUser);
        hasLoadedUser.resolve(Auth._currentUser);
      }, function() {
        //oops. must have been a faulty user. go anonymous for now
        Auth._clearUser();
        hasLoadedUser.resolve(Auth._currentUser);
      });
    } else {
      //they're anonymous
      Auth._resetUser();
      $timeout(function(){hasLoadedUser.resolve(Auth._currentUser);}, 0);
    }

    return hasLoadedUser.promise;
  };

  Auth.getCurrentUser = function() {
    return Auth._currentUser;
  };

  Auth.hasCurrentUser = function() {
    return hasLoadedUser.promise;
  };

  //to start, reset our user
  Auth._resetUser();

  return Auth;
});