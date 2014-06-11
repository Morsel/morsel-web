angular.module( 'Morsel.public.search.people.twitter', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'search.people.twitter', {
    url: '/twitter',
    views: {
      "search-results": {
        controller: 'SearchPeopleTwitterCtrl',
        templateUrl: 'app/public/search/results.tpl.html'
      }
    },
    access: {
      restricted : true
    }
  });
})

.controller( 'SearchPeopleTwitterCtrl', function SearchPeopleTwitterCtrl ($scope, searchUser){
  $scope.type = 'twitter';
});
