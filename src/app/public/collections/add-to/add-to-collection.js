angular.module( 'Morsel.public.collections.addToCollection', [] )

.directive('mrslAddToCollection', function($modal, $rootScope, $location, Auth, AfterLogin, $window, ApiUsers, ApiMorsels, ApiCollections, HandleErrors){
  return {
    restrict: 'A',
    scope: {
      morsel: '=mrslAddToCollection'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var currentUser,
          isLoggedIn,
          afterLoginCallback;

      Auth.getCurrentUserPromise().then(function(userData) {
        currentUser = userData;
        isLoggedIn = Auth.isLoggedIn();

        //check for an afterlogin callback on load
        if(AfterLogin.hasCallback('addToCollection')) {
          afterLoginCallback = AfterLogin.getCallback();

          //make sure it's the right morsel
          if(afterLoginCallback.data && (afterLoginCallback.data.morselId === scope.morsel.id)) {
            //make sure we're actually loggeed in just in case
            if(isLoggedIn) {
              openOverlay();
              AfterLogin.removeCallback();
            }
          }
        }
      });

      function openOverlay () {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'app/public/collections/add-to/add-to-collection-overlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            currentUser: function(){
              return currentUser;
            },
            morsel : function() {
              return scope.morsel;
            }
          }
        });
      }

      scope.beginAddToCollection = function() {
        //check if we're logged in
        if(isLoggedIn) {
          openOverlay();
        } else {
          var currentUrl = $location.url();

          //if not, set our callback for after we're logged in
          AfterLogin.setCallback({
            type: 'addToCollection',
            path: currentUrl,
            data: {
              morselId: scope.morsel.id
            }
          });

          $window.location.href = '/join';
        }
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, ApiUsers, currentUser, morsel) {
        //model
        $scope.collections = {};

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.addingNewCollection = true;

        $scope.$watch('collections.selectedCollection', function(newValue, oldValue) {
          if(newValue) {
            if(newValue !== '') {
              $scope.addingNewCollection = false;
            }
          } else {
            $scope.addingNewCollection = true;
          }
        });

        ApiUsers.getCollections(currentUser.id).then(function(resp){
          $scope.collections.collectionsOptions = resp.data;
        }, function(resp){
          HandleErrors.onError(resp.data, $scope.addToCollectionForm);
        });

        $scope.startAddToCollection = function() {
          var collectionParams;

          if($scope.addingNewCollection) {
            if($scope.collections.newCollectionTitle && $scope.collections.newCollectionTitle.length > 0) {
              collectionParams = {
                collection: {
                  title: $scope.collections.newCollectionTitle
                }
              };

              createCollection(collectionParams);
            }
          } else {
            //selecting an existing collection
            //make sure something is selected
            if($scope.collections.selectedCollection) {
              $scope.addToCollectionForm.morselExistingCollection.$setValidity('addingToExistingCollection', false);

              addToCollection($scope.collections.selectedCollection.id);
            }
          }
        };

        function addToCollection(collectionId) {
          ApiMorsels.addToCollection(morsel.id, collectionId).then(function(){
            $scope.addToCollectionForm.morselExistingCollection.$setValidity('addingToExistingCollection', true);
            closeOverlay();
          }, function(resp){
            $scope.addToCollectionForm.morselExistingCollection.$setValidity('addingToExistingCollection', true);
            HandleErrors.onError(resp.data, $scope.addToCollectionForm);
          });
        }

        function closeOverlay() {
          $modalInstance.dismiss('close');
        }

        function createCollection(collectionsParams) {
          ApiCollections.createCollection(collectionsParams).then(function(resp){
            addToCollection(resp.data.id);
          }, function(resp){
            HandleErrors.onError(resp.data, $scope.addToCollectionForm);
          });
        }
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'ApiUsers', 'currentUser', 'morsel'];
    },
    template: '<button type="button" ng-click="beginAddToCollection()" class="btn btn-xs btn-link" ng-attr-title="Add to Collection"><i class="common-like-filled"></i></button>'
  };
});