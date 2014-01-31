angular.module('Morsel.userImage', [])

.directive('userImage', [function() {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      username: '=',
      userPhotos: '=',
      size: '@class'
    },
    link: function(scope) {
      scope.returnPhoto = function(){
        var photoSize;

        switch(scope.size) {
          case 'profile-pic-xs':
            photoSize = '_40x40';
            break;

          case 'profile-pic-s':
            photoSize = '_72x72';
            break;

          case 'profile-pic-m':
            photoSize = '_80x80';
            break;

          default:
          case 'profile-pic-l':
            photoSize = '_144x144';
            break;
        }

        if(scope.userPhotos && scope.userPhotos[photoSize]) {
          return scope.userPhotos[photoSize];
        } else {
          return '';
        }
        
      };
    },
    template: '<a href="#/{{username}}" class="profile-pic-link">' +
                '<img ng-src="{{returnPhoto()}}" class="img-circle" />' +
              '</a>'
  };
}]);