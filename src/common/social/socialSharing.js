angular.module( 'Morsel.common.socialSharing', [] )

//like/unlike a morsel
.directive('mrslSocialSharing', function($location, Mixpanel, $window, PhotoHelpers, MORSELPLACEHOLDER, ApiUsers){
  return {
    restrict: 'A',
    scope: {
      subject : '=mrslSocialSharing',
      subjectType : '@mrslSocialSharingType',
      fullBtns : '=mrslSocialFull'
    },
    replace: true,
    link: function(scope, element, attrs) {
      scope.socialExpanded = true;

      scope.subjectType = scope.subjectType || 'morsel-detail';

      function shareMixpanel(socialType, shareSubject) {
        var props = {
              social_type : socialType,
              share_subject : shareSubject
            };

        if(shareSubject === 'morsel-detail') {
          props.morsel_id = scope.subject.id;
          props.creator_id = scope.subject.creator.id;
        } else if (shareSubject === 'scheduled-event') {
          props.scheduled_event_name = scope.subject.title;
        }

        Mixpanel.send('Clicked Share', props);
      }

      function getMediaImage() {
        var primaryItemPhotos = PhotoHelpers.findPrimaryItemPhotos(scope.morsel),
            lastItemWithPhotos;

        //use their cover photo if there is one
        if(primaryItemPhotos) {
          return primaryItemPhotos._992x992;
        } else {
          lastItemWithPhotos = PhotoHelpers.findLastItemWithPhotos(scope.morsel.items);
          return lastItemWithPhotos ? lastItemWithPhotos.photos._992x992 : MORSELPLACEHOLDER;
        }
      }

      scope.shareSocial = function(socialType) {
        if(scope.subjectType === 'morsel-detail') {
          shareMorselDetail(socialType);
        } else if(scope.subjectType === 'scheduled-event') {
          shareEvent(socialType);
        }
      };

      function shareMorselDetail(socialType) {
        var url,
            shareText,
            s = scope.subject,
            //backup
            morselUrl = s.url,
            facebookUrl = s.mrsl && s.mrsl.facebook_mrsl ? s.mrsl.facebook_mrsl : morselUrl,
            twitterUrl = s.mrsl && s.mrsl.twitter_mrsl ? s.mrsl.twitter_mrsl : morselUrl,
            linkedinUrl = s.mrsl && s.mrsl.linkedin_mrsl ? s.mrsl.linkedin_mrsl : morselUrl,
            pinterestUrl = s.mrsl && s.mrsl.pinterest_mrsl ? s.mrsl.pinterest_mrsl : morselUrl,
            googleplusUrl = s.mrsl && s.mrsl.googleplus_mrsl ? s.mrsl.googleplus_mrsl : morselUrl,
            clipboardUrl = s.mrsl && s.mrsl.clipboard_mrsl ? s.mrsl.clipboard_mrsl : morselUrl;

        shareMixpanel(socialType, 'morsel-detail');

        if(socialType === 'facebook') {
          url = 'https://www.facebook.com/sharer/sharer.php?u='+facebookUrl;
        } else if(socialType === 'twitter') {
          //need to make a separate call to get their twitter username
          ApiUsers.getUser(s.creator.username).then(function(userResp){
            var user = userResp.data,
                //use their handle if they have one - otherwise use their name
                twitterUsername = user.twitter_username ? '@'+user.twitter_username : user.first_name+' '+user.last_name;
            
            shareText = encodeURIComponent('"'+s.title+'" from '+twitterUsername+' on @eatmorsel '+twitterUrl);
            url = 'https://twitter.com/home?status='+shareText;
            $window.open(url);
          });

          return;
        } else if(socialType === 'linkedin') {
          url = 'https://www.linkedin.com/shareArticle?mini=true&url='+linkedinUrl;
        } else if(socialType === 'pinterest') {
          shareText = encodeURIComponent('"'+s.title+'" from '+s.creator.first_name+' '+s.creator.last_name+' on Morsel');
          url = 'https://pinterest.com/pin/create/button/?url='+pinterestUrl+'&media='+encodeURIComponent(getMediaImage())+'&description='+shareText;
        } else if(socialType === 'google-plus') {
          url = 'https://plus.google.com/share?url='+googleplusUrl;
        } else if(socialType === 'clipboard') {
          $window.prompt("Copy the following link to share:", clipboardUrl);
          return;
        }

        $window.open(url);
      }

      function shareEvent(socialType) {
        var url,
            shareText,
            s = scope.subject,
            shareUrl = scope.subject.url;

        shareMixpanel(socialType, 'scheduled-event');

        if(socialType === 'facebook') {
          url = 'https://www.facebook.com/sharer/sharer.php?u='+shareUrl;
        } else if(socialType === 'twitter') {
          shareText = encodeURIComponent(s.twitterUsername+'\'s '+s.title+' on @eatmorsel: '+shareUrl);
          url = 'https://twitter.com/home?status='+shareText;
        } else if(socialType === 'linkedin') {
          url = 'https://www.linkedin.com/shareArticle?mini=true&url='+shareUrl;
        } else if(socialType === 'pinterest') {
          shareText = encodeURIComponent(s.title+' on Morsel');
          url = 'https://pinterest.com/pin/create/button/?url='+shareUrl+'&media='+encodeURIComponent(s.image)+'&description='+shareText;
        } else if(socialType === 'google-plus') {
          url = 'https://plus.google.com/share?url='+shareUrl;
        } else if(socialType === 'clipboard') {
          $window.prompt("Copy the following link to share:", shareUrl);
          return;
        }

        $window.open(url);
      }
    },
    templateUrl: 'common/social/socialSharing.tpl.html'
  };
});