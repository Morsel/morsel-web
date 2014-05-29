angular.module( 'Morsel.public.home', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'app/public/home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' },
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      },
      hasSeenSplash: function($window, $location) {
        if($window.localStorage.passSplash) {
          $location.path('/feed');
        } else {
          return false;
        }
      }
    }
  });
})

.controller( 'HomeCtrl', function HomeCtrl( $scope, currentUser, $window, $location ) {
  $scope.viewOptions.miniHeader = true;

  $scope.continueToMorsel = function() {
    //user wants to continue on to their feed
    //set localstorage to remember this
    $window.localStorage.passSplash = true;
    //send them to their feed
    $location.path('/feed');
  };
});