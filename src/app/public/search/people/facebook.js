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

.controller( 'SearchPeopleFacebookCtrl', function SearchPeopleFacebookCtrl ($scope, searchUser, FacebookApi, $sce, $timeout, ApiUsers, $filter){
  $scope.search.searchPlaceholder = 'Search for Facebook friends on Morsel';

  if(searchUser.facebook_uid) {
    //override the parent scope function
    $scope.search.customSearch = _.debounce(filterFacebookUsers, $scope.search.waitTime);

    FacebookApi.init(function(){
      FacebookApi.login(getFacebookFriends);
    });
  } else {
    $scope.socialNotConnectedMessage = $sce.trustAsHtml('You haven\'t connected your Facebook account. <a href="/account/social-accounts" target="_self">Click here</a> to connect.');
  }

  function getFacebookFriends() {
    FacebookApi.getFriends(function (response) {

      if (response && !response.error) {
        getMorselFriends(response.data);
      }
    });
  }

  function getMorselFriends(fbFriends) {
    var friendsIds = '';

    if(fbFriends.length > 0) {
      //create a list "'id1','id2','id3'"
      _.each(fbFriends, function(f){
        friendsIds+= "'"+f.id+"',";
      });

      //chop off that last comma
      friendsIds = friendsIds.slice(0,-1);

      ApiUsers.AuthenticationConnects('facebook', friendsIds).then(function(friendsData){
        showResults(friendsData.data);
      });
    } else {
      //loser has no friends!
      showResults([]);
    }
  }

  function showResults(friendsData) {
    $scope.allSearchResultUsers = friendsData;
    //this one will be our filtered version
    $scope.searchResultUsers = $scope.allSearchResultUsers;
    _.defer(function(){$scope.$apply();});
  }

  function filterFacebookUsers() {
    if($scope.search.query.length >= 3) {
      $scope.searchResultUsers = $filter('nameMatch')($scope.allSearchResultUsers, $scope.search.query);
    } else {
      //reset to all users
      $scope.searchResultUsers = $scope.allSearchResultUsers;
    }

    _.defer(function(){$scope.$apply();});
  }
});
