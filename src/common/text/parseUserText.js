angular.module( 'Morsel.common.parseUserText', [] )
.factory('ParseUserText', function() {
  var ParseUserText = {};

  ParseUserText.hashtags = function(text, self) {
    if(text) {
      return text.replace(/(^|\s)(#[a-z_\d-]+)/ig, function($0,$1,$2,$3,$4,$5) {
        return $1+'<a href="/explore/morsels?q='+encodeURIComponent($2)+(self ? 'target="_self"':'')+'">'+$2+'</a>';
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
