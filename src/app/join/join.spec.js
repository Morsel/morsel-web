describe( 'Join controller', function() {

  beforeEach( module( 'Morsel' ) );
  beforeEach(inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();
    $controller('JoinCtrl', {$scope: $scope});
  }));

  it( 'should contain a joinMorsel function', inject( function(){
    expect($scope.joinMorsel).toBeDefined();
  }));
});