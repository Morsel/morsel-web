angular.module( 'Morsel.public.morselDetail', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'morselDetail', {
    //make sure our "username" isn't "users"
    url: '/:username/{morselDetails:.*}',
    views: {
      "main": {
        controller: 'MorselDetailCtrl',
        templateUrl: 'app/public/morsel-detail/morsel-detail.tpl.html'
      }
    },
    data:{ pageTitle: 'Morsel Detail' },
    resolve: {
      //get current user data before displaying so we don't run into odd situations of trying to perform user actions before user is loaded
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      },
      theMorsel: function($location, $stateParams, ApiMorsels, $q) {
        var username = $stateParams.username.toLowerCase(),
            morselDetailsArr = $stateParams.morselDetails.split('/'),
            morselIdSlug = morselDetailsArr[0];/*,
            itemNumber = parseInt(morselDetailsArr[1], 10);*/

        //check and make sure we pulled an idslug from the URL
        if(morselIdSlug && username) {
          return ApiMorsels.getMorsel(morselIdSlug).then(function(morselData){
            if (username != morselData.creator.username.toLowerCase()) {
              //this isn't a valid morsel for this user
              $location.path('/'+username);
            } else {
              return morselData;
            }
          }, function() {
            //if there's an error retrieving morsel data (bad id?), go to profile page for now
            $location.path('/'+username);
          });
        } else {
          //if not, send to profile page
          $location.path('/'+username);
        }
      }
    }
  });
})

.controller( 'MorselDetailCtrl', function MorselDetailCtrl( $scope, $stateParams, ApiMorsels, ApiUsers, $location, $window, currentUser, theMorsel, $state, landscapeAlert ) {
  $scope.morsel = theMorsel;
  //update page title
  $scope.pageData.pageTitle = $scope.morsel.title+' - '+$scope.morsel.creator.first_name+' '+$scope.morsel.creator.last_name+' | Morsel';

  //these pages should be viewed in portrait
  landscapeAlert();

  $scope.viewOptions.miniHeader = true;
  $scope.viewOptions.fullWidthHeader = true;
});