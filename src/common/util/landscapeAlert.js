angular.module( 'Morsel.common.landscapeAlert', [] )

//display a modal to users advising them to switch away from landscape orientation
.factory('landscapeAlert', function($rootScope, $modal, $window, presetMediaQueries) {

  return function() {
    //make sure we have matchMedia function. if not, we're probably not on a mobile device and don't have to worry about orientation anyway
    if (typeof(matchMedia) === 'function') {
      var smallScreenMq = matchMedia(presetMediaQueries['screen-sm-max']),
          orientationMq = matchMedia(presetMediaQueries['orientation-landscape']);

      //if user has a small device in landscape orientation
      if (smallScreenMq.matches && orientationMq.matches) {
        popOverlay();
      }
    }
  };

  function popOverlay() {
    if(!$window.localStorage.seenOrientationWarning) {
      //create and pop an alert
      var ModalInstanceCtrl = function ($scope, $modalInstance, $window) {

        $scope.ok = function () {
          $window.localStorage.seenOrientationWarning = true;
          $modalInstance.close();
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };

      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', '$window'];

      $rootScope.modalInstance = $modal.open({
        templateUrl: 'common/util/landscapeAlert.tpl.html',
        controller: ModalInstanceCtrl,
        resolve: {}
      });
    }
  }
});