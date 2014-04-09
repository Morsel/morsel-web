angular.module( 'Morsel.socialSharing', [] )

//like/unlike a morsel
.directive('socialSharing', function($location, Mixpanel){
  return {
    restrict: 'A',
    scope: {
      story : '=socialSharing'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var storyId,
          creatorId;

      scope.socialExpanded = true;
      scope.nonSwipeable = true;

      scope.currentUrl = encodeURIComponent($location.absUrl());

      scope.$watch('story', function(newValue, oldValue) {
        if(newValue) {
          storyId = newValue.id;
          creatorId = newValue.creator.id;
        }
      });

      scope.shareMixpanel = function(socialType) {
        Mixpanel.send('Tapped Share Morsel', {
          social_type : socialType,
          morsel_id : storyId,
          creator_id : creatorId
        });
      };
    },
    templateUrl: 'socialSharing/socialSharing.tpl.html'
  };
});