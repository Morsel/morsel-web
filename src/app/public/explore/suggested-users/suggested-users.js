angular.module( 'Morsel.public.explore.suggestedUsers', [] )

.directive('mrslSuggestedUsers', function(ApiUsers){
  return {
    scope: {
      suggestedUsers: '=mrslSuggestedUsers'
    },
    replace: true,
    link: function(scope, element, attrs) {
      //set our user-list layout
      scope.suggestedUserLayout = 'column';
    },
    templateUrl: 'app/public/explore/suggested-users/suggested-users.tpl.html'
  };
});