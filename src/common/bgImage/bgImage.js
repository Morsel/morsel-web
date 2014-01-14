angular.module( 'Morsel.bgImage', [] )

.directive('bgImage', function(){
  return function(scope, element, attrs){
    attrs.$observe('bgImage', function(value) {
      element.css({
        'background-image': 'url(' + value +')',
        'background-size' : 'cover'
      });
    });
  };
});