angular.module( 'Morsel.public.collections.addToCollection', [] )

.directive('mrslAddToCollection', function($modal, $rootScope, $location, Auth, AfterLogin, $window, ApiUsers, ApiMorsels, ApiCollections, HandleErrors, Mixpanel){
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
        Mixpanel.track('Clicked Add to Collection', {
          morsel_id: scope.morsel.id
        });

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
        //select model
        $scope.collections = {};

        //new collection model
        $scope.newCollection = {};

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
            if($scope.newCollection.title && $scope.newCollection.title.length > 0) {
              collectionParams = {
                collection: {
                  title: $scope.newCollection.title,
                  description: $scope.newCollection.description
                }
              };

              $scope.addToCollectionForm.$setValidity('creatingNewCollection', false);

              createCollection(collectionParams);
            }
          } else {
            //selecting an existing collection
            //make sure something is selected
            if($scope.collections.selectedCollection) {
              $scope.addToCollectionForm.$setValidity('addingToCollection', false);

              addToCollection($scope.collections.selectedCollection.id, false);
            }
          }
        };

        function addToCollection(collectionId, madeNewCollection) {
          ApiMorsels.addToCollection(morsel.id, collectionId).then(function(){
            Mixpanel.track('Added morsel to collection', {
              morsel_id: morsel.id,
              collection_id: collectionId,
              made_new_collection: madeNewCollection
            }, function(){
              closeOverlay();
            });

          }, function(resp){
            $scope.addToCollectionForm.$setValidity('addingToCollection', true);
            HandleErrors.onError(resp.data, $scope.addToCollectionForm);
          });
        }

        function closeOverlay() {
          $modalInstance.dismiss('close');
        }

        function createCollection(collectionsParams) {
          ApiCollections.createCollection(collectionsParams).then(function(resp){
            var collection = resp.data;

            $scope.addToCollectionForm.$setValidity('creatingNewCollection', true);

            Mixpanel.track('Created new Collection', {
              collection_id: collection.id,
              view: 'morsel_details',
              has_description: (collectionsParams.collection.description && collectionsParams.collection.description.length > 0) ? true : false
            });

            $scope.addToCollectionForm.$setValidity('addingToCollection', false);

            addToCollection(collection.id, true);
          }, function(resp){
            $scope.addToCollectionForm.morselExistingCollection.$setValidity('creatingNewCollection', true);
            HandleErrors.onError(resp.data, $scope.addToCollectionForm);
          });
        }
      };
    },
    template: '<button type="button" ng-click="beginAddToCollection()" class="btn btn-xs btn-link" title="Add to Collection"><i class="common-add-to-collection"></i></button>'
  };
});