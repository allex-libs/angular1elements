(function (lib, module) {
  'use strict';

  module.directive ('allexAngularMatchValidate', [function () {

    function checkMatch ($scope, field, ctrl) {
      return $scope.$eval(field) === ctrl.$viewValue;
    }

    function doValidate (ctrl) {
      ctrl.$validate();
    }

    return {
      restrict : 'A',
      require : 'ngModel',

      link : function ($scope, el, attrs, ctrl) {
        var field = attrs.allexAngularMatchValidate;
        ctrl.$validators.allexAngularMatchValidate = checkMatch.bind(null, $scope, field, ctrl, $scope);
        $scope.$watch (field, doValidate.bind(null, ctrl));
      }
    };
  }]);


})(ALLEX.lib, angular.module ('allex_angularwebcomponent'));

