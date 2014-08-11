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
    data:{ pageTitle: 'Food & Drink Inspiration From the Top Chefs, Mixologists, Sommeliers & Restaurants' },
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
  })
  //without this state, navigating to the route in hashbang mode (IE9) will give a 404. this fix is hacky and I hate it but until https://github.com/angular-ui/ui-router/issues/185 or https://github.com/angular-ui/ui-router/issues/293 gets solved, or better yet https://github.com/angular/angular.js/pull/5712 it'll have to do
  .state( 'home-no-slash', {
    url: '',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'app/public/home/home.tpl.html'
      }
    },
    resolve: {
      redirect: function($location) {
        $location.path('/');
      },
      currentUser: function(){
        return {};
      },
      hasSeenSplash: function(){
        return {};
      }
    }
  });
})

.controller( 'HomeCtrl', function HomeCtrl( $scope, currentUser, $window, $location ) {
  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.hideLogo = true;

  $scope.continueToMorsel = function() {
    //user wants to continue on to their feed
    //set localstorage to remember this
    $window.localStorage.passSplash = true;
    //send them to their feed
    $location.path('/feed');
  };
});