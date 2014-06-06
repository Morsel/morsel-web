angular.module( 'Morsel.public.search.people.facebook', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'search.people.facebook', {
    url: '/facebook',
    views: {
      "search-results": {
        controller: 'SearchPeopleFacebookCtrl',
        templateUrl: 'app/public/search/results.tpl.html'
      }
    },
    access: {
      restricted : true
    }
  });
})

.controller( 'SearchPeopleFacebookCtrl', function SearchPeopleFacebookCtrl ($scope, searchUser){
  $scope.type = 'facebook';
});
