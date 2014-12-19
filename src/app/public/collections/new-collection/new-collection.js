angular.module( 'Morsel.public.collections.newCollection', [] )

.directive('mrslNewCollection', function($rootScope, $modal, ApiCollections, HandleErrors, $location){
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

              $scope.newCollectionForm.$setValidity('creatingNewCollection', true);
              //go to new collection
              $location.path('/'+collection.creator.username.toLowerCase()+'/collections/'+collection.id+'-'+collection.slug);
            }, function(resp){
              $scope.newCollectionForm.$setValidity('creatingNewCollection', true);
              HandleErrors.onError(resp.data, $scope.newCollectionForm);
            });
          }
        };
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'ApiCollections'];
    },
    template: '<button type="button" ng-click="openOverlay()" class="new-collection-btn btn btn-lg"><i>&#43;</i><span>Create new collection</span></button>'
  };
});