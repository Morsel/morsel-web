angular.module( 'Morsel.common.auth', [
  'ngStorage'
] )

// Auth is used for all user authentication interactions
.factory('Auth', function($window, ApiUsers, Restangular, $q, $timeout, DEVICEKEY, DEVICEVALUE, VERSIONKEY, VERSIONVALUE, $modal, Mixpanel, $rootScope, RollbarFactory){
  var Auth = {},
      defaultRequestParams = {},
      loadedUser = $q.defer();

  //our fallback
  defaultRequestParams[DEVICEKEY] = DEVICEVALUE;
  defaultRequestParams[VERSIONKEY] = VERSIONVALUE;

  //"private" methods

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
      'auth_token': '',
      'username': null,
      'industry': null,
      'staff': false,
      'professional': false
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

    //update any Rollbar events to send user
    RollbarFactory.configure.person(Auth._currentUser);
  };

  //forget the user in our app
  Auth._clearUser = function() {
    Auth._updateUser(Auth._blankUser());
    Auth._forgetUser();

    //update any Rollbar events to not send user
    RollbarFactory.configure.person(Auth._currentUser);
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
  Auth.join = function(uploadUserData) {
    var deferred = $q.defer();

    ApiUsers.newUser(uploadUserData).then(function(loggedInUserResp) {
      Auth._updateUser(loggedInUserResp.data);
      deferred.resolve(loggedInUserResp.data);
    }, function(resp){
      Auth._clearUser();
      deferred.reject(resp);
    });

    return deferred.promise;
  };

  //log in an existing user
  Auth.login = function(userData) {
    var deferred = $q.defer();

    ApiUsers.loginUser(userData).then(function(loggedInUserResp) {
      Auth._updateUser(loggedInUserResp.data);
      deferred.resolve(loggedInUserResp.data);
    }, function(resp){
      Auth._clearUser();
      deferred.reject(resp);
    });

    return deferred.promise;
  };

  //log out a user
  Auth.logout = function(userData) {
    Auth._clearUser();
    $window.location.href = '/';
  };

  //intercept our API calls
  Auth.setupInterceptor = function() {
    Restangular.setErrorInterceptor(function(response) {
      var errors;

      //if an API call is blocked
      if (response.status === 401) {
        //check if it's unauthorized (vs a login error)
        if(response.data && response.data.errors && response.data.errors.api && response.data.errors.api === 'unauthorized') {
          //log user out
          Auth._clearUser();
          $window.location.href = '/login';
        }
      }

      if(response.data && response.data.errors && response.data.errors.api) {
        //response returned an api issue
        //report and error back to user
        Auth.showApiError(response.status, response.status.errors);
      }
    });
  };

  //Reset API params to the default
  Auth.resetAPIParams = function() {
    Restangular.setDefaultRequestParams(defaultRequestParams);
  };

  //return a promise about data for our current user
  Auth.setInitialUserData = function() {

    //if the current user is blank
    if(_.isEqual(Auth._currentUser, Auth._blankUser())) {
      //if there's a userId in the cookie
      if(Auth._getSavedUserId()) {
        //reset our key
        Auth._resetApiKey();
        //get the rest of the users data from the server
        ApiUsers.getMyData().then(function(loggedInUserResp) {
          //update the app's user
          Auth._updateUser(loggedInUserResp.data);
          loadedUser.resolve(Auth._currentUser);
        }, function() {
          //oops. must have been a faulty user. go anonymous for now
          Auth._clearUser();
          loadedUser.resolve(Auth._currentUser);
        });
      } else {
        //they're anonymous
        Auth._resetUser();
        $timeout(function(){
          loadedUser.resolve(Auth._currentUser);
        });
      }
    } else {
      //already have a user loaded. return her
      $timeout(function(){
        loadedUser.resolve(Auth._currentUser);
      });
    }

    return loadedUser.promise;
  };

  Auth.getCurrentUserPromise = function() {
    return loadedUser.promise;
  };

  //a bit sketchy, but we need this to check for restricted routes without having to wait for the user to resolve. check if userId and authToken are present in the cookie (doesn't account for potentially invalid values)
  Auth.potentiallyLoggedIn = function() {
    return Auth._getSavedUserId() && Auth._getSavedUserAuthToken() ? true : false;
  };

  //the following methods shouldn't be called until we've returned a user (getCurrentUserPromise has been called) since they assume that we have our "final" user loaded

  Auth.isLoggedIn = function() {
    return !_.isEqual(Auth._currentUser, Auth._blankUser());
  };

  //check user type
  Auth.isStaff = function() {
    return Auth.isLoggedIn() && Auth._currentUser.staff;
  };

  Auth.isProfessional = function() {
    return Auth.isLoggedIn() && Auth._currentUser.professional;
  };

  //end logged-in methods

  Auth.updateUser = function(userData) {
    Auth._updateUser(userData);
  };

  Auth.showApiError = function(status, errors) {
    var ModalInstanceCtrl,
        errorList = errors || 'No error message';

    //send error report to mixpanel
    Mixpanel.send('Error - API', {
      http_status: status,
      error_message : JSON.stringify(errorList)
    });

    ModalInstanceCtrl = function ($scope, $modalInstance) {
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };

    //we need to implicitly inject dependencies here, otherwise minification will botch them
    ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance'];

    $rootScope.modalInstance = $modal.open({
      templateUrl: 'common/auth/apiError.tpl.html',
      controller: ModalInstanceCtrl,
      resolve: {}
    });
  };

  //to start, reset our user
  Auth._resetUser();

  return Auth;
});