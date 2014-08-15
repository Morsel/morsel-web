angular.module( 'Morsel.common.cuisinesSpecialties', [] )

//show cuisines and specialties for user to update
.directive('mrslCuisinesSpecialties', function(ApiUsers, ApiKeywords, $q){
  return {
    scope: {
      user: '=mrslCuisinesSpecialtiesUser'
    },
    replace: true,
    link: function(scope, element, attrs) {
      var allCuisinesPromise,
          userCuisinesPromise,
          allCuisines,
          userCuisines,
          allSpecialtiesPromise,
          userSpecialtiesPromise,
          allSpecialties,
          userSpecialties;

      //cuisines

      //get all the cuisines
      allCuisinesPromise = getAllCuisines();
      //get the cuisines the user has
      userCuisinesPromise = getUserCuisines();

      //when all cuisine data has returned
      $q.all([allCuisinesPromise, userCuisinesPromise]).then(function(){
        //an array of objects of form {keyword:{}, tag:{}}
        scope.cuisineList = constructList(allCuisines, userCuisines);
      });

      //specialties
      //get all the specialties
      allSpecialtiesPromise = getAllSpecialties();
      //get the specialties the user has
      userSpecialtiesPromise = getUserSpecialties();

      //when all specialty data has returned
      $q.all([allSpecialtiesPromise, userSpecialtiesPromise]).then(function(){
        //an array of objects of form {keyword:{}, tag:{}}
        scope.specialtyList = constructList(allSpecialties, userSpecialties);
      });

      function getAllCuisines() {
        var deferred = $q.defer();

        ApiKeywords.getAllCuisines().then(function(allCuisineResp){
          allCuisines = allCuisineResp.data;
          deferred.resolve();
        });

        return deferred.promise;
      }

      function getUserCuisines() {
        var deferred = $q.defer();

        ApiUsers.getCuisines(scope.user.id).then(function(userCuisineResp){
          userCuisines = userCuisineResp.data;
          deferred.resolve();
        });

        return deferred.promise;
      }

      function getAllSpecialties() {
        var deferred = $q.defer();

        ApiKeywords.getAllSpecialties().then(function(allSpecialtyResp){
          allSpecialties = allSpecialtyResp.data;
          deferred.resolve();
        });

        return deferred.promise;
      }

      function getUserSpecialties() {
        var deferred = $q.defer();

        ApiUsers.getSpecialties(scope.user.id).then(function(userSpecialtyResp){
          userSpecialties = userSpecialtyResp.data;
          deferred.resolve();
        });

        return deferred.promise;
      }

      //tag helpers
      function constructList(allKeywords, userTags) {
        var keywords = [],
            list = [],
            //max 4 column layout
            cols = 4,
            rows,
            count = 0;

        _.each(allKeywords, function(keyword) {
          var matchingTag = findTagByKeywordId(userTags, keyword.id);

          keywords.push({
            keyword: keyword,
            name: keyword.name,
            tag: matchingTag,
            isChecked: matchingTag ? true : false
          });
        });

        //how many rows do we need per column
        rows = Math.ceil(keywords.length/cols);

        for( var i =0 ; i < cols;i++){
          list.push([]);
          for( var j =0 ; j < rows;j++){
            list[i][j] = keywords[count];
            count++;
            if(count>=keywords.length) {
              break;
            }
          }
        }

        return list;
      }

      function findTagByKeywordId(tags, keywordId) {
        return _.find(tags, function(tag) {
          return tag.keyword.id === keywordId;
        });
      }

      function userHasKeyword(tags, id) {
        //does the keyword id match one of the tags' keywords?
        var keywordMatch = _.find(tags, function(tag) {
          return tag.keyword.id === id;
        });

        return keywordMatch ? true : false;
      }

      scope.toggleTag = function(item) {
        //check our model
        if(item.isChecked) {
          //user toggled on, create tag
          ApiKeywords.createUserTag(scope.user.id, item.keyword.id).then(function(newTagResp){
            //confirmed delete, update local array
            item.tag = newTagResp.data;
          });
        } else {
          //user toggled off, delete tag
          ApiKeywords.deleteUserTag(scope.user.id, item.tag.id).then(function(resp){
            //confirmed delete, update local array
            item.tag = null;
          });
        }
      };
    },
    templateUrl: 'common/user/cuisinesSpecialties.tpl.html'
  };
});