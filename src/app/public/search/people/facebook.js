angular.module( 'Morsel.public.search.users.facebook', [])

.config(function config( $stateProvider ) {
  //set up an abstract state for our main views
  $stateProvider.state( 'search.users.facebook', {
    url: '/facebook',
    views: {
      "search-results": {
        controller: 'SearchUsersFacebookCtrl',
        templateUrl: 'app/public/search/results.tpl.html'
      }
    },
    access: {
      restricted : true
    }
  });
})

.controller( 'SearchUsersFacebookCtrl', function SearchUsersFacebookCtrl ($scope, searchUser, FacebookApi, $sce, $timeout, ApiUsers, $filter){
  $scope.search.searchPlaceholder = 'Search for Facebook friends on Morsel';
  $scope.searchType = 'facebook';
  $scope.socialSearch = true;
  //clear query when switching
  $scope.search.query = '';

  if(searchUser.facebook_uid) {
    //override the parent scope function
    $scope.search.customSearch = _.debounce(filterFacebookUsers, $scope.search.waitTime);

    //assume we have friends to start
    $scope.hasFriendsOnMorsel = true;
    $scope.socialConnected = true;

    FacebookApi.init(function(){
      //after we log in, make sure our fb token is up to date
      FacebookApi.login(updateFbToken);
    });
  } else {
    $scope.socialConnected = false;
    $scope.socialNotConnectedMessage = $sce.trustAsHtml('You haven\'t connected your Facebook account. <a href="/account/social-accounts" target="_self">Click here</a> to connect.');
  }

  function updateFbToken(fbResp) {
    FacebookApi.updateToken(fbResp.authResponse.accessToken, getFacebookFriends);
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
        friendsIds+= f.id+',';
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
    //if the user has facebook friends on morsel
    if(friendsData.length > 0) {
      $scope.hasFriendsOnMorsel = true;
      //either there are some on morsel or there aren't
      $scope.allSearchResultUsers = friendsData;
      //this one will be our filtered version
      $scope.searchResultUsers = $scope.allSearchResultUsers;
    } else {
      //set invite state
      $scope.hasFriendsOnMorsel = false;
    }

    //refresh our scope
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
