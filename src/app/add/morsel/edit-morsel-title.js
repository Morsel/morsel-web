angular.module('Morsel.add.editMorselTitle', [])

.directive('mrslEditMorselTitle', function(ApiMorsels) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=mrslEditMorselTitle',
      morselTemplate: '=mrslEditMorselTitleTemplate'
    },
    link: function(scope, element, attrs) {
      scope.editing = false;

      if(scope.morsel.title) {
         //due to current bug in the app, we need to manually check the title against the templates to determine if it actually has a title https://www.pivotaltracker.com/story/show/79033104
        if(scope.morselTemplate && scope.morselTemplate.title && (scope.morsel.title === (scope.morselTemplate.title+' morsel'))) {
          //reset the title
          scope.morsel.title = null;

          //display the placeholder
          scope.placeholder = scope.morselTemplate.title + ' morsel';
        }
      } else {
        //if there isn't a title
        if(scope.morselTemplate && scope.morselTemplate.title) {
          //use the placeholder if there is one
          scope.placeholder = scope.morselTemplate.title + ' morsel';
        } else {
          scope.placeholder = 'Untitled morsel';
        }
      }

      //this will be our model
      scope.updatedTitle = scope.morsel.title;

      scope.$watch('morsel.title', function(newValue){
        if(newValue && newValue.length > 0) {
          scope.morselTitleForm.morselTitle.$setValidity('morselHasTitle', true);
        } else {
          scope.morselTitleForm.morselTitle.$setValidity('morselHasTitle', false);
          //use the placeholder
          scope.placeholder = scope.morselTemplate.title + ' morsel';
        }
      });

      scope.edit = function(){
        scope.editing = true;
        scope.morselTitleForm.morselTitle.$setValidity('morselTitleSaved', false);
        //set "$dirty" for onbeforeunload
        scope.$emit('add.dirty', {
          key: 'morselTitle',
          value: true
        });
      };

      scope.cancel = function(){
        scope.updatedTitle = scope.morsel.title;
        scope.editing = false;
        scope.morselTitleForm.morselTitle.$setValidity('morselTitleSaved', true);
        //set "$pristine" for onbeforeunload
        scope.$emit('add.dirty', {
          key: 'morselTitle',
          value: false
        });
      };

      scope.save = function(e) {
        //treat null titles as empty strings so we don't bother updating null values with blanks
        var newTitle = scope.updatedTitle ? scope.updatedTitle.trim() : '',
            oldTitle = scope.morsel.title ? scope.morsel.title : '',
            morselParams = {
              morsel: {
                title: newTitle
              }
            };

        //need to prevent this from bubbling up and submitting our main form
        e.preventDefault();

        scope.saving = true;

        //check if anything changed before hitting API
        if(newTitle === oldTitle) {
          scope.editing = false;
          scope.morselTitleForm.morselTitle.$setValidity('morselTitleSaved', true);
          //set "$pristine" for onbeforeunload
          scope.$emit('add.dirty', {
            key: 'morselTitle',
            value: false
          });
          scope.saving = false;
        } else {
          ApiMorsels.updateMorsel(scope.morsel.id, morselParams).then(function() {
            //set our local model
            scope.morsel.title = scope.updatedTitle.trim();
            scope.editing = false;
            scope.morselTitleForm.morselTitle.$setValidity('morselTitleSaved', true);
            //set "$pristine" for onbeforeunload
            scope.$emit('add.dirty', {
              key: 'morselTitle',
              value: false
            });
            scope.saving = false;
          }, function(resp) {
            scope.saving = false;
            scope.$emit('add.error', resp);
          });
        }
      };
    },
    templateUrl: 'app/add/morsel/edit-morsel-title.tpl.html'
  };
}).directive('editVideoMorsel', function(ApiMorsels) {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      morsel: '=editVideoMorsel'
    },
    link: function(scope, element, attrs) {
      scope.morsel_video=scope.morsel.morsel_video?scope.morsel.morsel_video: null;
      scope.video_text=scope.morsel.video_text?scope.morsel.video_text: null;
      scope.placeholder= "Video Title";
      scope.$watch('video_text', function(newValue){
        scope.video_text=newValue;
      });
      scope.$watch('morsel_video', function(newValue){
        scope.morsel_video=newValue;
      });
      scope.saveVideo = function(e) {
         e.preventDefault();
         scope.saving = true;
        //treat null titles as empty strings so we don't bother updating null values with blanks
         var morselParams = {
              morsel: {
                morsel_video: scope.morsel_video,
                video_text: scope.video_text
              }
            };
          ApiMorsels.updateMorsel(scope.morsel.id, morselParams).then(function(res) {
            scope.editing = false;
            scope.saving = false;
            scope.video_text=res.video_text;
            scope.morsel_video=res.morsel_video;
          }, function(resp) {
            scope.saving = false;
            scope.$emit('add.error', resp);
          });

        //need to prevent this from bubbling up and submitting our main form
      };
      scope.editVideo = function(){
        scope.editing = true;
      };

      scope.cancel = function(){
        scope.editing = false;
        scope.video_text = scope.video_text;
        scope.morsel_video = scope.morsel_video;
      };

    },
    templateUrl: 'app/add/morsel/edit-video-morsel.tpl.html'
  };
});
