angular.module( 'Morsel.public.collections.editCollection', [] )

.directive('mrslEditCollection', function($modal, $rootScope, Auth, ApiCollections, HandleErrors){
  return {
    restrict: 'A',
    scope: {
      collection: '=mrslEditCollection'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var currentUser;

      Auth.getCurrentUserPromise().then(function(userData) {
        currentUser = userData;
      });

      scope.openEditCollectionOverlay = function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'app/public/collections/edit-collection/edit-collection-overlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            currentUser: function(){
              return currentUser;
            },
            collection : function() {
              return scope.collection;
            }
          }
        });
      };

      function emitDeleteEvent(collectionId) {
        scope.$emit('collection.delete', collectionId);
      }

      var ModalInstanceCtrl = function ($scope, $modalInstance, currentUser, collection, ApiCollections, HandleErrors) {
        $scope.collection = collection;
        //model
        $scope.collectionModel = _.clone($scope.collection);

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        //title length validation
        $scope.titleLengthVer = {
          'length': {
            'max': '70',
            'message': 'Must be 70 characters or less'
          }
        };

        $scope.deleteCollection = function() {
          var confirmed = confirm('Are you sure you want to delete this collection?');

          if(confirmed) {
            $scope.editCollectionForm.deleteMorsel.$setValidity('deleting', false);
            ApiCollections.deleteCollection($scope.collection.id).then(onCollectionDeleteSuccess, onCollectionDeleteError);
          }
        };

        function onCollectionDeleteSuccess(resp) {
          emitDeleteEvent($scope.collection.id);

          //close overlay
          closeOverlay();
        }

        function onCollectionDeleteError(resp) {
          //make form valid again (until errors show)
          $scope.editCollectionForm.deleteMorsel.$setValidity('deleting', true);
          
          //remove whatever message is there
          $scope.alertMessage = null;

          HandleErrors.onError(resp.data, $scope.editCollectionForm);
        }

        //submit our form
        $scope.saveCollection = function() {
          var collectionData = {
            collection: {
              'title': $scope.collectionModel.title,
              'description': $scope.collectionModel.description
            }
          };

          //check if everything is valid
          if($scope.editCollectionForm.$valid) {
            //disable form while request fires
            $scope.editCollectionForm.$setValidity('loading', false);

            //call our updateUser method to take care of the heavy lifting
            ApiCollections.updateCollection($scope.collectionModel.id, collectionData).then(onCollectionSaveSuccess, onCollectionSaveError);
          }
        };

        function onCollectionSaveSuccess(resp) {
          var collectionData = resp.data ? resp.data : resp;
          
          //update our page's collection
          $scope.collection.title = collectionData.title;
          $scope.collection.description = collectionData.description;

          //close overlay
          closeOverlay();
        }

        function onCollectionSaveError(resp) {
          //make form valid again (until errors show)
          $scope.editCollectionForm.$setValidity('loading', true);
          
          //remove whatever message is there
          $scope.alertMessage = null;

          HandleErrors.onError(resp.data, $scope.editCollectionForm);
        }

        function closeOverlay() {
          $modalInstance.dismiss('close');
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'currentUser', 'collection', 'ApiCollections', 'HandleErrors'];
    },
    template: '<button title="Edit this collection" class="btn btn-link" ng-click="openEditCollectionOverlay()">Edit this collection</button>'
  };
});