angular.module( 'Morsel.common.activity', [] )

.directive('mrslActivity', function(MORSELPLACEHOLDER, PhotoHelpers){
  return {
    scope: {
      activity: '=mrslActivity'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.morselPlaceholder = MORSELPLACEHOLDER;

      scope.getMorselPhoto = function(morsel) {
        var primaryPhotos = PhotoHelpers.findPrimaryItemPhotos(morsel);

        if(primaryPhotos) {
          return primaryPhotos._100x100;
        } else {
          return MORSELPLACEHOLDER;
        }
      };
    },
    templateUrl: 'common/user/activity.tpl.html'
  };
});