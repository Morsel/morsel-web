angular.module('Morsel.add.templates', [] )

.directive('mrslAddTemplate', function($rootScope, $modal){
  return {
    restrict: 'A',
    replace: true,
    scope: {
      templateData: '=mrslAddTemplate'
    },
    link: function(scope, element, attrs) {
      scope.showOverlay = function () {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'app/add/templates/templateOverlay.tpl.html',
          controller: ModalInstanceCtrl,
          size: 'lg',
          resolve: {
            templateData : function(){
              return scope.templateData;
            }
          }
        });
      };

      var ModalInstanceCtrl = function ($scope, $modalInstance, templateData) {
        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.templateData = templateData;

        $scope.something = 'hello';
      };
      //we need to implicitly inject dependencies here, otherwise minification will botch them
      ModalInstanceCtrl['$inject'] = ['$scope', '$modalInstance', 'templateData'];
    },
    templateUrl: 'app/add/templates/template.tpl.html'
  };
});