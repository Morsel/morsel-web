angular.module( 'Morsel.public.explore.morsels', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'explore.morsels', {
    url: '/morsels',
    views: {
      "explore-results": {
        controller: 'ExploreMorselsCtrl',
        templateUrl: 'app/public/explore/morsels/results.tpl.html'
      }
    }
  });
})

.controller( 'ExploreMorselsCtrl', function ExploreMorselsCtrl (){
});
