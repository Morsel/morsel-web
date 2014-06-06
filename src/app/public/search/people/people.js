angular.module( 'Morsel.public.search.people', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'search.people', {
    abstract: true,
    url: '/people',
    controller: 'SearchPeopleCtrl',
    template: '<div ui-view="search-results"></div>'
  });
})

.controller( 'SearchPeopleCtrl', function SearchPeopleCtrl ($scope, searchUser){
});
