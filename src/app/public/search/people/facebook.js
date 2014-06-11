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

.controller( 'SearchPeopleFacebookCtrl', function SearchPeopleFacebookCtrl ($scope, searchUser, FacebookApi){
  //override the parent scope function
  $scope.search.customSearch = _.debounce(searchFacebookUsers, $scope.search.waitTime);
  
  //our initial state should be empty
  $scope.searchResultUsers = [];


  //login with fb
  FacebookApi.login(getFriends);

  function getFriends() {

  }

  function searchFacebookUsers() {
    var userSearchData = {
          'user[query]': $scope.search.query
        };

    if($scope.search.query.length >= 3) {
      //remove current users to show loader
      $scope.searchResultUsers = null;


      /*ApiUsers.search(userSearchData).then(function(searchResp) {
        $scope.searchResultUsers = searchResp.data;
      });*/
    }
  }
});
