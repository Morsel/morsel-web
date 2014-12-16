angular.module( 'Morsel.public.collections.collectionDetail', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'collectionDetail', {
    url: '/:username/collections/{collectionDetails:.*}',
    views: {
      "main": {
        controller: 'CollectionDetailCtrl',
        templateUrl: 'app/public/collections/collection-detail/collection-detail.tpl.html'
      }
    },
    resolve: {
      //get the user data of the profile before we try to render the page
      profileUserData: function(ApiUsers, $stateParams, $state) {
        return ApiUsers.getUser($stateParams.username).then(function(userResp) {
          return userResp.data;
        }, function() {
          //if there's an error retrieving user data (bad username?), send to 404
          $state.go('404');
        });
      },
      collection: function($location, $stateParams, ApiCollections) {
        var username = $stateParams.username.toLowerCase(),
            collectionDetailsArr = $stateParams.collectionDetails.split('/'),
            collectionIdSlug = collectionDetailsArr[0];

        //check and make sure we pulled an idslug from the URL
        if(collectionIdSlug && username) {
          return ApiCollections.getCollection(collectionIdSlug).then(function(collectionResp){
            if (collectionResp) {
              return collectionResp.data;
            } else {
              //this isn't a valid collection for this user
              $location.path('/'+username+'/collections');
            }
          }, function() {
            //if there's an error retrieving collection data (bad id?), go to collections for now
            $location.path('/'+username+'/collections');
          });
        } else {
          //if not, send to collections
          $location.path('/'+username+'/collections');
        }
      }
    }
  });
})

.controller( 'CollectionDetailCtrl', function CollectionDetailCtrl( $scope, profileUserData, collection, ApiCollections, $location, MORSEL_LIST_NUMBER ) {
  $scope.user = profileUserData;
  $scope.collection = collection;

  //make sure the collection belongs to the right user
  if($scope.user.id != $scope.collection.user_id) {
    $location.path('/'+$scope.user.username+'/collections');
  } else {
    $scope.canEdit = true;
  }

  $scope.collectionsIncrement = MORSEL_LIST_NUMBER;

  $scope.loadCollectionMorsels = function() {
    var morselsParams = {
          count: $scope.collectionsIncrement
        };

    //get the next page number
    $scope.morselsPageNumber = $scope.morselsPageNumber ? $scope.morselsPageNumber+1 : 1;
    morselsParams.page = $scope.morselsPageNumber;

    ApiCollections.getCollectionMorsels($scope.collection.id, morselsParams).then(function(morselsResp){
      if($scope.morsels) {
        //concat them with new data after old data
        $scope.morsels = $scope.morsels.concat(morselsResp.data);
      } else {
        $scope.morsels = morselsResp.data;
      }
    });
  };

  $scope.loadCollectionMorsels();
});