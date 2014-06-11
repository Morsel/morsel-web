angular.module( 'Morsel.common.truncate', [] )

//truncate an amount of text
.filter('truncate', function(){
  return function (input, chars) {
    if (isNaN(chars)) {
      return input;
    }
    
    if (chars <= 0) {
      return '';
    }

    if (input && input.length > chars) {
      var lastspace;

      input = input.substring(0, chars);

      lastspace = input.lastIndexOf(' ');

      //get last space
      if (lastspace !== -1) {
        input = input.substr(0, lastspace);
      }
      return input + '...';
    }
    
    return input;
  };
});