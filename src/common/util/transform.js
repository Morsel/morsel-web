angular.module( 'Morsel.common.transform', [] )

.factory('Transform', function() {
  var Transform = {},
      transformProperty = 'transform';

  ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
    var e = prefix + 'Transform';
    if (typeof document.body.style[e] !== 'undefined') {
      transformProperty = e;
      return false;
    }
    return true;
  });

  Transform.getProperty = function() {
    return transformProperty;
  };

  return Transform;
});