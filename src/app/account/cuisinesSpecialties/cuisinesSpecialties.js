angular.module( 'Morsel.account.cuisinesSpecialties', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'account.cuisines-specialties', {
    url: '/cuisines-specialties',
    parent: 'account',
    views: {
      "account-body": {
        controller: 'CuisinesSpecialtiesCtrl',
        templateUrl: 'app/account/cuisinesSpecialties/cuisinesSpecialties.tpl.html'
      }
    },
    data:{
      pageTitle: 'Cuisines & Specialties'
    },
    access: {
      restricted : true
    }
  });
})

.controller( 'CuisinesSpecialtiesCtrl', function CuisinesSpecialtiesCtrl($scope, accountUser) {
  $scope.accountUser = accountUser;
});
