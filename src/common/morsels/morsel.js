angular.module('Morsel.common.morsel', [])

.constant('COVER_PHOTO_PERCENTAGE', 0.6)

.directive('mrslMorsel', function($window, PhotoHelpers, MORSELPLACEHOLDER, Auth, COVER_PHOTO_PERCENTAGE, ApiMorsels, ApiUsers) {
  var //debounce on page resize/orientation change
      orientationChangeTime = 300;

  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslMorsel'
    },
    link: function(scope) {
      var onOrientationChange,
          winEl = angular.element($window),
          windowOldWidth = window.innerWidth,
          taggedUserShownCount = 2;

      //hold all our computed layout measurements
      scope.layout = {};
      updateCoverHeight();

      scope.canEdit = false;

      Auth.getCurrentUserPromise().then(function(userData){
        scope.canEdit = scope.morsel.creator.id === userData.id;
      });

      if(scope.morsel.tagged_users_count > 0) {
        ApiMorsels.getTaggedUsers(scope.morsel.id).then(function(usersResp){
          var taggedUsers = usersResp.data,
              shownTaggedUsers = taggedUsers.slice(0, taggedUserShownCount);

          scope.morsel.shownTaggedUsers = shownTaggedUsers;
          scope.morsel.hiddenTaggedUserCount = scope.morsel.tagged_users_count - shownTaggedUsers.length;
        });
      }

      //get user info for following button
      ApiUsers.getUser(scope.morsel.creator.id).then(function(userResp){
        scope.morsel.creator = userResp.data;
      });

      scope.getCoverPhotoArray = function(previewSized) {
        var primaryItemPhotos;

        if(scope.morsel && scope.morsel.items) {
          primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(scope.morsel);

          if(primaryItemPhotos) {
            if(previewSized) {
              return primaryItemPhotos._50x50;
            } else {
              return [
                ['default', primaryItemPhotos._320x320],
                ['(min-width: 321px)', primaryItemPhotos._480x480],
                ['screen-xs', primaryItemPhotos._640x640],
                ['screen-md', primaryItemPhotos._992x992]
              ];
            }
          } else {
            var lastItemWithPhotos = PhotoHelpers.findLastItemWithPhotos(scope.morsel.items);

            if(lastItemWithPhotos) {
              if(previewSized) {
                return lastItemWithPhotos.photos._50x50;
              } else {
                return [
                  ['default', lastItemWithPhotos.photos._320x320],
                  ['(min-width: 321px)', lastItemWithPhotos.photos._480x480],
                  ['screen-xs', lastItemWithPhotos.photos._640x640],
                  ['screen-md', lastItemWithPhotos.photos._992x992]
                ];
              }
            } else {
              //no items have photos
              if(previewSized) {
                return MORSELPLACEHOLDER;
              } else {
                return [
                  ['default', MORSELPLACEHOLDER]
                ];
              }
            }
            return [
              ['default', MORSELPLACEHOLDER]
            ];
          }
        } else {
          //return blank
          return [];
        }
      };

      scope.getItemPhotoArray = function(item) {
        if(item) {
          if(item.photos) {
            return [
              ['default', item.photos._320x320],
              ['(min-width: 321px)', item.photos._480x480],
              ['screen-xs', item.photos._640x640]
            ];
          } else {
            return [
              ['default', MORSELPLACEHOLDER]
            ];
          }
        } else {
          //return blank
          return [];
        }
      };

      function updateCoverHeight() {
        scope.layout.coverHeight = window.innerHeight*COVER_PHOTO_PERCENTAGE;
      }

      //resize cover page on resize
      onOrientationChange = _.debounce(function(){
        //make sure the width changed and it's not just the address bar moving on mobile
        if(window.innerWidth != windowOldWidth) {
          windowOldWidth = window.innerWidth;
          updateCoverHeight();
          scope.$apply();
        }
      }, orientationChangeTime);

      // handle orientation change
      winEl.bind('orientationchange', onOrientationChange);
      winEl.bind('resize', onOrientationChange);

      scope.$on('$destroy', function() {
        winEl.unbind('orientationchange', onOrientationChange);
        winEl.unbind('resize', onOrientationChange);
      });
    },
    templateUrl: 'common/morsels/morsel.tpl.html'
  };
})

.directive('mrslItemDescription', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      item: '=mrslItemDescription'
    },
    link: function(scope, element) {
      scope.formatDescription = function() {
        if(scope.item && scope.item.description) {
          return scope.item.description.replace(/(\r\n|\n|\r)/g,"<br />");
        } else {
          return '';
        }
      };
    },
    template: '<div class="item-description" ng-if="item.description"><p ng-bind-html="formatDescription()"></p></div>'
  };
})

.directive('mrslTaggedUserList', function($modal, $rootScope, USER_LIST_NUMBER, ApiMorsels) {
  return {
    restrict: 'A',
    scope: {
      morsel: '=mrslTaggedUserList'
    },
    link: function(scope, element) {
      scope.showTaggedUsers = function(){
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'common/user/userListOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            morsel: function () {
              return scope.morsel;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, morsel) {
        $scope.heading = 'Tagged Users';
        $scope.emptyText = 'There are no users tagged';

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.loadUsers = function(endUser) {
          var usersParams = {
                count: USER_LIST_NUMBER
              };

          if(endUser) {
            usersParams.max_id = parseInt(endUser.id, 10) - 1;
          }

          ApiMorsels.getTaggedUsers(morsel.id, usersParams).then(function(usersResp){
            if($scope.users) {
              $scope.users = $scope.users.concat(usersResp.data);
            } else {
              $scope.users = usersResp.data;
            }
          });
        };

        $scope.loadUsers();
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'morsel'];
    },
    template: '<a ng-bind="morsel.hiddenTaggedUserCount + \' other\'+ (morsel.hiddenTaggedUserCount === 1 ? \'\': \'s\')" ng-click="showTaggedUsers()"></a>'
  };
})

.directive('mrslFeedNav', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      feedItem: '=mrslFeedNav',
      navDirection: '@mrslFeedNavDirection'
    },
    link: function(scope, element) {
      scope.nextNavigation = scope.navDirection === 'next';
    },
    templateUrl: 'common/morsels/morselFeedNav.tpl.html'
  };
});