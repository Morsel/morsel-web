angular.module( 'Morsel.immersive', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'immersive', {
    url: '/immersive',
    views: {
      "main": {
        controller: 'ImmersiveCtrl',
        templateUrl: 'immersive/immersive.tpl.html'
      }
    },
    data:{ pageTitle: 'Sample Immersive Page' }
  });
})

.controller( 'ImmersiveCtrl', function ImmersiveCtrl( $scope, ApiUsers, $timeout ) {
  $scope.viewOptions.hideHeader = true;
  $scope.viewOptions.hideFooter = true;

  /*$scope.stories = [
    {
      'name':'story 1',
      morsels: [
        {
          'name':'morsel 1',
          'color':'red'
        },
        {
          'name':'morsel 2',
          'color':'blue'
        },
        {
          'name':'morsel 3',
          'color':'green'
        }
      ]
    },
    {
      'name':'story 2',
      morsels: [
        {
          'name':'morsel 4',
          'color':'cyan'
        },
        {
          'name':'morsel 5',
          'color':'magenta'
        },
        {
          'name':'morsel 6',
          'color':'yellow'
        }
      ]
    },
    {
      'name':'story 3',
      morsels: [
        {
          'name':'morsel 7',
          'color':'beige'
        },
        {
          'name':'morsel 8',
          'color':'gray'
        },
        {
          'name':'morsel 9',
          'color':'black'
        }
      ]
    }
  ];*/

  ApiUsers.getMorsels('jasonvincent').then(function(morselsData){
    $scope.stories = morselsData;
  });

  ApiUsers.getUser('jasonvincent').then(function(userData){
    $scope.owner = userData;
  });
});