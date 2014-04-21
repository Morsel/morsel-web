angular.module( 'Morsel.socialSharing', [] )

//like/unlike a morsel
.directive('socialSharing', function($location, Mixpanel, $window){
  return {
    restrict: 'A',
    scope: {
      morsel : '=socialSharing',
      fullBtns : '=socialFull'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var morselId,
          creatorId,
          cURL = encodeURIComponent($location.absUrl());

      scope.socialExpanded = true;
      scope.nonSwipeable = true;

      scope.$watch('morsel', function(newValue, oldValue) {
        if(newValue) {
          morselId = newValue.id;
          creatorId = newValue.creator.id;
        }
      });

      function shareMixpanel(socialType) {
        Mixpanel.send('Tapped Share Morsel', {
          social_type : socialType,
          morsel_id : morselId,
          creator_id : creatorId
        });
      }

      function getMediaImage() {
        var primaryItem,
            m = scope.morsel;

        //if they have a collage, use it
        if(m.photos) {
          return m.photos._400x300;
        } else {
          //use their cover photo as backup
          primaryItem = _.find(m.items, function(i) {
            return i.id === m.primary_item_id;
          });

          if(primaryItem && primaryItem.photos) {
            return primaryItem.photos._992x992;
          } else {
            return m[0].photos._992x992;
          }
        }
      }

      scope.shareSocial = function(socialType) {
        var url,
            shareText,
            s = scope.morsel,
            twitterUsername = '@'+s.creator.twitter_username;

        shareMixpanel(socialType);

        if(socialType === 'facebook') {
          url = 'https://www.facebook.com/sharer/sharer.php?u='+cURL;
        } else if(socialType === 'twitter') {
          shareText = encodeURIComponent('"'+s.title+'" from '+(twitterUsername || (s.creator.first_name+' '+s.creator.last_name))+' on @eatmorsel ');
          url = 'https://twitter.com/home?status='+shareText+cURL;
        } else if(socialType === 'linkedin') {
          url = 'https://www.linkedin.com/shareArticle?mini=true&url='+cURL;
        } else if(socialType === 'pinterest') {
          shareText = encodeURIComponent('"'+s.title+'" from '+s.creator.first_name+' '+s.creator.last_name+' on Morsel');
          url = 'https://pinterest.com/pin/create/button/?url='+cURL+'&media='+encodeURIComponent(getMediaImage())+'&description='+shareText;
        } else if(socialType === 'google_plus') {
          url = 'https://plus.google.com/share?url='+cURL;
        }

        $window.open(url);
      };
    },
    templateUrl: 'socialSharing/socialSharing.tpl.html'
  };
});