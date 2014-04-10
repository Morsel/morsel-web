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
          cURL = encodeURIComponent($location.absUrl());

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
        var url,
            shareText,
            s = scope.story,
            twitterUsername = s.creator.twitter_username;

        shareMixpanel(socialType);

        if(socialType === 'facebook') {
          url = 'https://www.facebook.com/sharer/sharer.php?u='+cURL;
        } else if(socialType === 'twitter') {
          shareText = encodeURIComponent('"'+s.title+'" from '+(twitterUsername || (s.creator.first_name+' '+s.creator.last_name))+' on @eatmorsel ');
          url = 'https://twitter.com/home?status='+shareText+cURL;
        } else if(socialType === 'linkedin') {
          url = 'https://www.linkedin.com/shareArticle?mini=true&url='+cURL+'&title=&summary=&source=';
        } else if(socialType === 'pinterest') {
          shareText = encodeURIComponent('"'+s.title+'" from '+s.creator.first_name+' '+s.creator.last_name+' on Morsel');
          url = 'https://pinterest.com/pin/create/button/?url='+cURL+'&media='+cURL+'&description='+shareText;
        } else if(socialType === 'google_plus') {
          url = 'https://plus.google.com/share?url='+cURL;
        }

        $window.open(url);
      };
    },
    templateUrl: 'socialSharing/socialSharing.tpl.html'
  };
});