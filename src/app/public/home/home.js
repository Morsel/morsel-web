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
    data:{ pageTitle: 'A culinary community sharing food stories, cooking inspiration and kitchen hacks' },
    resolve: {}
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
      }
    }
  });
})

.controller( 'HomeCtrl', function HomeCtrl( $scope, $location, Restangular, $filter, Mixpanel, AfterLogin, Auth, $window ) {
  var currentUser,
      isLoggedIn,
      afterLoginCallback;

  Auth.getCurrentUserPromise().then(function(userData) {
    currentUser = userData;
    isLoggedIn = Auth.isLoggedIn();

    //check for an afterlogin callback on load
    if(AfterLogin.hasCallback('mastheadCreate')) {
      afterLoginCallback = AfterLogin.getCallback();

      //make sure we're actually loggeed in just in case
      if(isLoggedIn) {
        AfterLogin.removeCallback();
        goToAdd();
      }
    }
  });

  function goToAdd() {
    $window.location.href = '/add';
  }

  $scope.createMorsel = function() {
    Mixpanel.track('Clicked Masthead Button', {
      button_text: 'Create Morsel'
    });

    if(isLoggedIn) {
      goToAdd();
    } else {
      var currentUrl = $location.url();

      //if not, set our callback for after we're logged in
      AfterLogin.setCallback({
        type: 'mastheadCreate',
        path: currentUrl
      });

      $window.location.href = '/join';
    }
  };

  //pull our data from static data on s3
  Restangular.oneUrl('featuredMorsels', 'https://morsel.s3.amazonaws.com/static-morsels/homepage-morsels.json').get().then(function(resp) {
    $scope.featuredMorsels = $filter('orderBy')(Restangular.stripRestangular(resp), 'displayOrder');
  }, function() {
    //if not, send to homepage
    $location.path('/');
  });
});