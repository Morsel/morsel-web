angular.module( 'Morsel.socialSharing', [] )

//like/unlike a morsel
.directive('socialSharing', function($location, Mixpanel, $window){
  return {
    restrict: 'A',
    scope: {
      story : '=socialSharing'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var storyId,
          creatorId,
          currentUrl = encodeURIComponent($location.absUrl());

      scope.socialExpanded = true;
      scope.nonSwipeable = true;

      scope.$watch('story', function(newValue, oldValue) {
        if(newValue) {
          storyId = newValue.id;
          creatorId = newValue.creator.id;
        }
      });

      function shareMixpanel(socialType) {
        Mixpanel.send('Tapped Share Morsel', {
          social_type : socialType,
          morsel_id : storyId,
          creator_id : creatorId
        });
      }

      scope.shareSocial = function(socialType) {
        var url;

        shareMixpanel(socialType);

        if(socialType === 'facebook') {
          url = 'https://www.facebook.com/sharer/sharer.php?u='+currentUrl;
        } else if(socialType === 'twitter') {
          url = 'https://twitter.com/home?status='+currentUrl;
        } else if(socialType === 'linkedin') {
          url = 'https://www.linkedin.com/shareArticle?mini=true&url='+currentUrl+'&title=&summary=&source=';
        } else if(socialType === 'pinterest') {
          url = 'https://pinterest.com/pin/create/button/?url='+currentUrl+'&media='+currentUrl+'&description=';
        } else if(socialType === 'google_plus') {
          url = 'https://plus.google.com/share?url='+currentUrl;
        }

        $window.open(url);
      };
    },
    templateUrl: 'socialSharing/socialSharing.tpl.html'
  };
});