// http://codepen.io/brunoscopelliti/pen/ECyka
angular.module( 'Morsel.match', [] )

//set validation based on multiple inputs
.directive('match', [function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {
      scope.$watch('[' + attrs.ngModel + ', ' + attrs.match + ']', function(value){
        ctrl.$setValidity('match', value[0] === value[1] );
      }, true);
    }
  };
}]);
