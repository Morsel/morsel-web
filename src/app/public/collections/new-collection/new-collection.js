angular.module( 'Morsel.public.collections.newCollection', [] )

.directive('mrslNewCollection', function($rootScope, $modal, ApiCollections, HandleErrors, $location, Mixpanel){
  return {
    restrict: 'A',
    replace: true,
    scope: {},
    link: function(scope, element, attrs) {
      scope.openOverlay = function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'app/public/collections/new-collection/new-collection-overlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {}
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, ApiCollections) {
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

        $scope.newCollection = function() {
          var collectionParams;

          if($scope.newCollection.title && $scope.newCollection.title.length > 0) {
            collectionParams = {
              collection: {
                title: $scope.newCollection.title,
                description: $scope.newCollection.description
              }
            };

            $scope.newCollectionForm.$setValidity('creatingNewCollection', false);

            ApiCollections.createCollection(collectionParams).then(function(resp){
              var collection = resp.data;

              Mixpanel.track('Created new Collection', {
                collection_id: collection.id,
                view: 'user_profile_collections',
                has_description: (collection.description && collection.description.length > 0) ? true : false
              });

              $location.path('/'+collection.creator.username.toLowerCase()+'/collections/'+collection.id+'-'+collection.slug);
            }, function(resp){
              $scope.newCollectionForm.$setValidity('creatingNewCollection', true);
              HandleErrors.onError(resp.data, $scope.newCollectionForm);
            });
          }
        };
      };
    },
    template: '<button type="button" ng-click="openOverlay()" class="new-collection-btn btn btn-lg"><i>&#43;</i><span>Create new collection</span></button>'
  };
});