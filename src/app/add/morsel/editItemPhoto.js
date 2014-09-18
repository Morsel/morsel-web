angular.module( 'Morsel.add.editItemPhoto', [] )

.directive('mrslEditItemPhoto', function(MORSELPLACEHOLDER, $rootScope, $modal, $window){
  return {
    restrict: 'A',
    scope: {
      item: '=mrslEditItemPhoto',
      primaryId: '@mrslEditItemPhotoCoverId'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.openItemPhotoOverlay = function () {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'app/add/morsel/editItemPhoto.tpl.html',
          controller: ModalInstanceCtrl,
          windowClass: 'add-item-photo-preview',
          resolve: {
            item: function () {
              return scope.item;
            }
          }
        });
      };

      scope.findItemThumbnail = function() {
        if(scope.item.photos && scope.item.photos._100x100) {
          return scope.item.photos._100x100;
        } else if(scope.item.displayTemplate && scope.item.displayTemplate.placeholder_photos && scope.item.displayTemplate.placeholder_photos.large) {
          return scope.item.displayTemplate.placeholder_photos.large;
        } else {
          return MORSELPLACEHOLDER;
        }
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, item, MORSELPLACEHOLDER, $window) {
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.getBiggestPhoto = function() {
          if(item.photos) {
            return [
              ['default', item.photos._320x320],
              ['(min-width: 320px)', item.photos._480x480],
              ['(min-width: 480px)', item.photos._640x640],
              ['(min-width: 640px)', item.photos._992x992]
            ];
          } else {
            if(item.displayTemplate && item.displayTemplate.placeholder_photos && item.displayTemplate.placeholder_photos.large) {
              return [
                ['default', item.displayTemplate.placeholder_photos.large]
              ];
            } else {
              return [
                ['default', MORSELPLACEHOLDER]
              ];
            }
          }
        };
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'item', 'MORSELPLACEHOLDER', '$window'];
    },
    template: '<div class="item-photo"><img ng-src="{{findItemThumbnail(item)}}" ng-click="openItemPhotoOverlay()" /><span ng-if="primaryId == item.id" class="banner banner-cover" title="This photo is the cover photo">Cover</span></div>'
  };
});