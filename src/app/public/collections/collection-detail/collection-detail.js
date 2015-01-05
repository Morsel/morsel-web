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
      //get current user data before displaying so we don't run into odd situations of trying to perform user actions before user is loaded
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      },
      collection: function($location, $stateParams, ApiCollections) {
        var username = $stateParams.username.toLowerCase(),
            collectionDetailsArr = $stateParams.collectionDetails.split('/'),
            collectionIdSlug = collectionDetailsArr[0];

        //check and make sure we pulled an idslug from the URL
        if(collectionIdSlug && username) {
          return ApiCollections.getCollection(collectionIdSlug).then(function(collectionResp){
            var collectionData = collectionResp.data;

            if (username != collectionData.creator.username.toLowerCase()) {
              //this isn't a valid collection for this user
              $location.path('/'+username+'/collections');
            } else {
              return collectionData;
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

.controller( 'CollectionDetailCtrl', function CollectionDetailCtrl( $scope, collection, ApiCollections, $location, currentUser, $sce, ApiMorsels, $timeout ) {
  $scope.collection = collection;
  $scope.currentUser = currentUser;

  //see if this is our collection
  if($scope.collection.creator.id === $scope.currentUser.id) {
    $scope.canEdit = true;
  }

  //update page title
  $scope.pageData.pageTitle = $scope.collection.title+' | Morsel';

  $scope.loadCollectionMorsels = function(params) {
    ApiCollections.getCollectionMorsels($scope.collection.id, params).then(function(morselsResp){
      if($scope.morsels) {
        //concat them with new data after old data
        $scope.morsels = $scope.morsels.concat(morselsResp.data);
      } else {
        $scope.morsels = morselsResp.data;
      }
    });
  };

  $scope.$on('collection.delete', function(e, collectionId) {
    //double check
    if(collectionId === $scope.collection.id) {
      $scope.collectionDeleted = true;
      $scope.alertMessage = $sce.trustAsHtml('Your collection has been successfully deleted. Click <a href="/'+$scope.currentUser.username+'/collections">here</a> to return to your collections.');
      $scope.alertType = 'success';
    }
  });

  $scope.removeFromCollection = function(morselId){
    var confirmed = confirm('Are you sure you want to remove this morsel from this collection?');

    if(confirmed) {
      ApiMorsels.removeFromCollection(morselId, $scope.collection.id).then(function(resp){
        //don't actually remove it from the model because it'll mess up pagination
        var removedMorsel = _.find($scope.morsels, function(m){
              return m.id === morselId;
            });

        //set a flag to display in view
        removedMorsel.removed = true;

        //alert users
        showMorselRemovalAlert('success', 'Morsel successfully removed from collection');
      }, function(resp) {
        showMorselRemovalAlert('danger', 'There was a problem removing the morsel from this collection');
      });
    }
  };

  function showMorselRemovalAlert(type, message) {
    $scope.alertMessage = $sce.trustAsHtml(message);
    $scope.alertType = type;
    //remove error alert after a bit
    $timeout(function(){
      $scope.alertMessage = false;
    }, 8000);
  }

  $scope.getUserPhoto = function() {
    if($scope.collection.creator.photos) {
      return [
        ['default', $scope.collection.creator.photos._80x80],
        ['screen-md', $scope.collection.creator.photos._144x144]
      ];
    } else {
      return [
        ['default', MORSELPLACEHOLDER]
      ];
    }
  };
});