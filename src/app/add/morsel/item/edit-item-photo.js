angular.module( 'Morsel.add.editItemPhoto', [] )

.directive('mrslEditItemPhoto', function(MORSELPLACEHOLDER, $rootScope, $modal, $window, ApiItems){
  return {
    restrict: 'A',
    scope: {
      item: '=mrslEditItemPhoto',
      primaryId: '=mrslEditItemPhotoCoverId'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.openItemPhotoOverlay = function () {
        //if user closed the overlay while still uploading a pic, don't let them open it again until it finishes
        if(!scope.item.uploading) {
          $rootScope.modalInstance = $modal.open({
            templateUrl: 'app/add/morsel/item/edit-item-photo-overlay.tpl.html',
            controller: ModalInstanceCtrl,
            windowClass: 'add-item-photo-preview',
            resolve: {
              item: function () {
                return scope.item;
              },
              itemPhotoForm: function() {
                return scope.itemPhotoForm;
              }
            }
          });
        }
      };

      scope.findItemThumbnail = function() {
        if(scope.item.photos && scope.item.photos._100x100) {
          scope.itemPhotoForm.itemHiddenPhoto.$setValidity('itemHasPhoto', true);
          return scope.item.photos._100x100;
        } else if(scope.item.displayTemplate && scope.item.displayTemplate.placeholder_photos && scope.item.displayTemplate.placeholder_photos.medium) {
          scope.itemPhotoForm.itemHiddenPhoto.$setValidity('itemHasPhoto', false);
          return scope.item.displayTemplate.placeholder_photos.medium;
        } else {
          scope.itemPhotoForm.itemHiddenPhoto.$setValidity('itemHasPhoto', false);
          return MORSELPLACEHOLDER;
        }
      };

      //set form as invalid while things are uploading
      scope.$watch('item.uploading', function(newValue) {
        if(newValue) {
          //set form invalid
          scope.itemPhotoForm.itemHiddenPhoto.$setValidity('itemPhotoDoneUploading', false);
          //set "$dirty" for onbeforeunload
          scope.$emit('add.dirty', {
            key: 'itemPhoto_'+scope.item.id,
            value: true
          });
        } else if(newValue === false) {
          //set form valid
          scope.itemPhotoForm.itemHiddenPhoto.$setValidity('itemPhotoDoneUploading', true);
          //set "$pristine" for onbeforeunload
          scope.$emit('add.dirty', {
            key: 'itemPhoto_'+scope.item.id,
            value: false
          });
        }
      });

      var ModalInstanceCtrl = function ($scope, $modalInstance, item, itemPhotoForm, MORSELPLACEHOLDER, $window, ApiItems, $timeout) {
        $scope.item = item;

        $scope.successfulUpload = false;

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.getBiggestPhoto = function() {
          if(item.photos) {
            return [
              //since we want the whole photo to show on the screen, check the height also
              ['default', item.photos._320x320],
              ['(min-width: 320px) and (min-height: 320px)', item.photos._640x640],
              ['(min-width: 640px) and (min-height: 640px)', item.photos._992x992]
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

        $scope.changePhoto = function() {
          ApiItems.getItem(item.id, true).then(function(resp){
            $scope.item.presigned_upload = resp.data.presigned_upload;
            $scope.changingPhoto = true;
          });
        };

        //update our overlay state when we're done uploading
        $scope.$watch('item.uploading', function(newValue, oldValue) {
          if(newValue === false && oldValue) {
            $scope.changingPhoto = false;
            //show photo upload success
            $scope.successfulUpload = true;

            //fade out success
            $timeout(function(){
              $scope.successfulUpload = false;
            }, 5000);
          }
        });
      };
    },
    templateUrl: 'app/add/morsel/item/edit-item-photo.tpl.html'
  };
});