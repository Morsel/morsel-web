angular.module( 'Morsel.public.requests', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'requests', {
    url: '/requests',
    views: {
      "main": {
        controller: 'requestsCtrl',
        templateUrl: 'app/public/requests/requests.tpl.html'
      }
    },
    data:{ pageTitle: 'Requests' },
    access: {
      restricted : true
    }, 
    resolve: {
      //get current user data before displaying
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      }
    }
  });
})

.controller( 'requestsCtrl', function requestsCtrl( $scope, currentUser, ApiRequests, Mixpanel ) {
  $scope.user = currentUser;

  $scope.loadRequests = function(params) {
    ApiRequests.getAsscociatedUsers($scope.user.id).then(function(associatedUserResp){
     
      $scope.associatedUsers=associatedUserResp.data;
    });
  };

  $scope.loadRequests();
  
  $scope.acceptHost = function(request) {
  
    if(request.is_approved=="false"){

        ApiRequests.permitHost($scope.user.id,request.host_user.id).then(function(response){
         
          $scope.associatedUsers=response.data;
          
        });
      }
  };

  
});