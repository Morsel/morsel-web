angular.module( 'Morsel.common.nameMatch', [] )

.filter('nameMatch', function() {
  return function(users, search) {
    return _.filter(users, function(user){
      var fullName = user.first_name + ' ' + user.last_name;

      return fullName.toLowerCase().indexOf(search) != -1;
    });
  };
});