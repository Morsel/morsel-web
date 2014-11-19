angular.module( 'Morsel.public.search.users', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'search.users', {
    url: '/users',
    controller: 'SearchUsersCtrl',
    template: '<div ui-view="search-results"></div>'
  });
})

.controller( 'SearchUsersCtrl', function SearchUsersCtrl ($scope, searchUser, ApiUsers, $state){
  $scope.search.emptyText = 'No users match your search';

  $state.go('search.users.facebook', null, {location:'replace'});
});
