angular.module( 'Morsel.common.parseUserText', [] )
.factory('ParseUserText', function() {
  var ParseUserText = {};

  ParseUserText.hashtags = function(text) {
    if(text) {
      return text.replace(/(^|\s)(#[a-z_\d]+)/ig, function($0,$1,$2) {
        return $1+'<a href="/hashtags/'+encodeURIComponent($2.slice(1))+'">'+$2+'</a>';
      });
    } else {
      return null;
    }
  };

  ParseUserText.addBreakTags = function(text) {
    if(text) {
      return text.replace(/(\r\n|\n|\r)/g,"<br />");
    } else {
      return null;
    }
  };

  return ParseUserText;
});
