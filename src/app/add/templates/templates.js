angular.module('Morsel.add.templates', [] )

.directive('mrslAddTemplate', function($rootScope, $modal){
  return {
    restrict: 'A',
    replace: true,
    scope: {
      templateData: '=mrslAddTemplate',
      justHelp: '@mrslAddTemplateHelp'
    },
    link: function(scope, element, attrs) {
      scope.templateClick = function () {
        //if it's quick add
        if(scope.templateData.id === 1) {
          if(scope.justHelp) {
            //show overlay if we're on the add/edit page
            showOverlay();
          } else {
            //skip it if we're trying to create
            createMorsel(1);
          }
        } else {
          showOverlay();
        }
      };

      function showOverlay() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'app/add/templates/template-overlay.tpl.html',
          controller: ModalInstanceCtrl,
          size: 'lg',
          resolve: {
            templateData : function(){
              return scope.templateData;
            },
            justHelp : function() {
              return scope.justHelp;
            }
          }
        });
      }

      var ModalInstanceCtrl = function ($scope, $modalInstance, templateData, justHelp) {
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.templateData = templateData;

        $scope.something = 'hello';
        $scope.justHelp = justHelp;

        $scope.createMorsel = function() {
          createMorsel($scope.templateData.id);
          $modalInstance.dismiss('cancel');
        };
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'templateData', 'justHelp'];

      function createMorsel(templateId) {
        var morselParams = {
          morsel: {
            template_id: templateId
          }
        };

        scope.$emit('add.morsel', morselParams);
      }
    },
    templateUrl: 'app/add/templates/template.tpl.html'
  };
});