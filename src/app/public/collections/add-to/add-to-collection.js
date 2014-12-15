angular.module( 'Morsel.public.collections.addToCollection', [] )

.directive('mrslAddToCollection', function($modal, $rootScope, $location, Auth, AfterLogin, $window){
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
          resolve: {}
        });
      }

      scope.addToCollection = function() {
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

      var ModalInstanceCtrl = function ($scope, $modalInstance) {
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance'];
    },
    template: '<button type="button" ng-click="addToCollection()" class="btn btn-xs btn-link" ng-attr-title="Add to Collection"><i class="common-like-filled"></i></button>'
  };
});