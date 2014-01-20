angular.module( 'Morsel.bgImage', [] )

//create a background-image on an element
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