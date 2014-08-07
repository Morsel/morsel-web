angular.module( 'Morsel.common.socialSharing', [] )

//like/unlike a morsel
.directive('mrslSocialSharing', function($location, Mixpanel, $window){
  return {
    restrict: 'A',
    scope: {
      morsel : '=mrslSocialSharing',
      fullBtns : '=mrslSocialFull'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var morselId,
          creatorId;
          //cURL = encodeURIComponent($location.absUrl());//for testing

      scope.socialExpanded = true;
      scope.nonSwipeable = true;

      scope.$watch('mrslMorsel', function(newValue, oldValue) {
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
        var primaryItem = _.find(scope.morsel.items, function(i) {
          return i.id === scope.morsel.primary_item_id;
        });

        //use their cover photo if there is one
        if(primaryItem && primaryItem.photos) {
          return primaryItem.photos._992x992;
        } else {
          //if not, use first item with a photo
          return _.find(scope.morsel.items, function(i) {
            return i.photos;
          }).photos._992x992;
        }
      }

      scope.shareSocial = function(socialType) {
        var url,
            shareText,
            s = scope.morsel,
            //use their handle if they have one - otherwise use their name
            twitterUsername = s.creator.twitter_username ? '@'+s.creator.twitter_username : s.creator.first_name+' '+s.creator.last_name,
            //backup
            morselUrl = s.url,
            facebookUrl = s.mrsl && s.mrsl.facebook_mrsl ? s.mrsl.facebook_mrsl : morselUrl,
            twitterUrl = s.mrsl && s.mrsl.twitter_mrsl ? s.mrsl.twitter_mrsl : morselUrl,
            linkedinUrl = s.mrsl && s.mrsl.linkedin_mrsl ? s.mrsl.linkedin_mrsl : morselUrl,
            pinterestUrl = s.mrsl && s.mrsl.pinterest_mrsl ? s.mrsl.pinterest_mrsl : morselUrl,
            googleplusUrl = s.mrsl && s.mrsl.googleplus_mrsl ? s.mrsl.googleplus_mrsl : morselUrl,
            clipboardUrl = s.mrsl && s.mrsl.clipboard_mrsl ? s.mrsl.clipboard_mrsl : morselUrl;

        shareMixpanel(socialType);

        if(socialType === 'facebook') {
          url = 'https://www.facebook.com/sharer/sharer.php?u='+facebookUrl;
        } else if(socialType === 'twitter') {
          shareText = encodeURIComponent('"'+s.title+'" from '+twitterUsername+' on @eatmorsel '+twitterUrl);
          url = 'https://twitter.com/home?status='+shareText;
        } else if(socialType === 'linkedin') {
          url = 'https://www.linkedin.com/shareArticle?mini=true&url='+linkedinUrl;
        } else if(socialType === 'pinterest') {
          shareText = encodeURIComponent('"'+s.title+'" from '+s.creator.first_name+' '+s.creator.last_name+' on Morsel');
          url = 'https://pinterest.com/pin/create/button/?url='+pinterestUrl+'&media='+encodeURIComponent(getMediaImage())+'&description='+shareText;
        } else if(socialType === 'google-plus') {
          url = 'https://plus.google.com/share?url='+googleplusUrl;
        } else if(socialType === 'clipboard') {
          window.prompt("Copy the following link to share:", clipboardUrl);
          return;
        }

        $window.open(url);
      };
    },
    templateUrl: 'common/social/socialSharing.tpl.html'
  };
});