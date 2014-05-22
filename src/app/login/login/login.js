angular.module( 'Morsel.login.login', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'login', {
    url: '/login?next',
    views: {
      "main": {
        controller: 'LoginCtrl',
        templateUrl: 'app/login/login/login.tpl.html'
      }
    },
    data:{
      pageTitle: 'Login'
    },
    resolve: {
      //make sure we resolve a user before displaying
      loginUser:  function(Auth, $window, $q){
        var deferred = $q.defer();

        Auth.getCurrentUserPromise().then(function(userData){
          //don't let a logged in user to this page
          if(Auth.isLoggedIn()) {
            $window.location.href = '/';
          } else {
            deferred.resolve(userData);
          }
        });

        return deferred.promise;
      }
    }
  });
})

.controller( 'LoginCtrl', function LoginCtrl( $scope, $stateParams, Auth, $window, HandleErrors, AfterLogin, loginUser ) {

  //model to store our join data
  $scope.loginModel = {};

  //called on submit of login form
  $scope.login = function() {
    var userData = {
      'user': {
        'login': $scope.loginModel.login,
        'password': $scope.loginModel.password
      }
    };

    //check if everything is valid
    if($scope.loginForm.$valid) {
      Auth.login(userData).then(onSuccess, onError);
    }
    
    function onSuccess(resp) {
      //if successfully logged in check if we have anything in the to-do queue
      if(AfterLogin.hasCallback()) {
        AfterLogin.goToCallbackPath();
      } else {
        //if they were on their way to a certain page
        if($stateParams.next) {
          $window.location.href = $stateParams.next;
        } else {
          //send them home
          $window.location.href = '/';
        }
      }
    }

    function onError(resp) {
      //wipe out last password
      $scope.loginModel.password = '';
      //set pristine so error handling doesn't trigger immediately
      $scope.loginForm.password.$setPristine();
      HandleErrors.onError(resp.data, $scope.loginForm);
    }
  };
});