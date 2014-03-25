angular.module( 'Morsel.pageData', [])

.factory('PageData', function() {
  var title = 'Morsel';
  
  return {
    title: function() { 
      return title;
    },
    setTitle: function(newTitle) {
      title = newTitle;
    }
   };
});