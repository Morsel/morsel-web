angular.module( 'Morsel.login.login', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'auth.login', {
    url: '/login?next',
    parent: 'auth',
    views: {
      "auth-view": {
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
            //$window.location.href = '/feed';
          } else {
            deferred.resolve(userData);
          }
        });

        return deferred.promise;
      }
    }
  }).state( 'auth.loginifrm', {
    url: '/loginifrm?id&&token',
    views: {
      "auth-view": {
        controller: 'loginifrmCtrl',
        templateUrl: ''
      }
    }
  });
})

.controller( 'loginifrmCtrl', function loginifrmCtrl( $scope ,$stateParams,Auth,$window,localStorageService) {

    localStorageService.set('userId', $stateParams.id);
    localStorageService.set('auth_token', $stateParams.token);
     var url = $window.location.origin+'/addnewmorsel';
     $window.location.href = url ;

    //   var userData = {
    //   'user': {
    //     'login': $stateParams.login,
    //     'password': $stateParams.password
    //   }
    // };
    // Auth.login(userData).then(onSuccess, onError);
    // function onSuccess(resp) {

    //  var url = $window.location.origin+'/addnewmorsel';
    //  $window.location.href = url ;
    // }
    // function onError(resp) {
    //   alert('You have added wrong creadencial');
    // }

})
.controller( 'LoginCtrl', function LoginCtrl( $scope, $stateParams, Auth, $window, HandleErrors, AfterLogin, loginUser, Mixpanel ) {

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
      //disable form while request fires
      $scope.loginForm.$setValidity('loading', false);
      Auth.login(userData).then(onSuccess, onError);
    }

    function onSuccess(resp) {
      //use a callback so we don't switch windows while the mixpanel event is still firing
      Mixpanel.track('Logged in', {
        login_type: 'email'
      }, function() {
        //if successfully logged in check if we have anything in the to-do queue
        if(AfterLogin.hasCallback()) {
          AfterLogin.goToCallbackPath();
        } else {
          //if they were on their way to a certain page
          if($stateParams.next) {
            $window.location.href = $stateParams.next;
          } else {
            //send them to feed
            $window.location.href = '/feed';
          }
        }
      });
    }

    function onError(resp) {
      //make form valid again (until errors show)
      $scope.loginForm.$setValidity('loading', true);

      //wipe out last password
      $scope.loginModel.password = '';
      //set pristine so error handling doesn't trigger immediately
      $scope.loginForm.password.$setPristine();
      HandleErrors.onError(resp.data, $scope.loginForm);
    }
  };
});
