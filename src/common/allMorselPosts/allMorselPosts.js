angular.module( 'allMorselPosts', [] )

// AllMorselPosts gets all existing morsels
.factory('AllMorselPosts', function($http, Restangular) {
  var AllMorselPosts = function() {
    this.posts = [];
    this.busy = false;
    this.after = '';
  };

  AllMorselPosts.prototype.nextPage = function() {
    if (this.busy) {
      return;
    }
    this.busy = true;

    var url = "http://morsel-api-staging.herokuapp.com/api/posts.json?api_key=1";
    console.log('out');
    Restangular.oneUrl('googlers', url).get().then(function(data) {
      console.log('in');
      console.log(data);
      return;
      /*for (var i = 0; i < data.length; i++) {
        this.posts.push(data[i]);
      }
      this.after = "t3_" + this.posts[this.posts.length - 1].id;
      this.busy = false;*/
    }.bind(this));
  };

  return AllMorselPosts;
});