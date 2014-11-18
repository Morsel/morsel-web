angular.module( 'Morsel.public.search.people', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'search.people', {
    url: '/people',
    controller: 'SearchPeopleCtrl',
    template: '<div ui-view="search-results"></div>'
  });
})

.controller( 'SearchPeopleCtrl', function SearchPeopleCtrl ($scope, searchUser, ApiUsers, $state){
  $scope.search.emptyText = 'No users match your search';

  $state.go('search.people.facebook', null, {location:'replace'});
});
