(function (lib, module) {
  'use strict';

  module.directive ('allexDatetimePicker', ['$parse', function ($parse) {
    function doSetData (ngModel, mv, vv) {
      ngModel.$setViewValue(mv);
      ngModel.$commitViewValue();
    }

    function onDPChange(scope, ngModel, evnt) {
      var date = evnt.date;
      scope.$apply (doSetData.bind(null, ngModel, date ? date.valueOf() : null));
    }
    return {
      restrict : 'A',
      require : 'ngModel',
      link : function (scope, element, attrs, ngModel) {
        $(element).datetimepicker($parse(attrs.allexDatetimePicker)(scope));
        $(element).on('dp.change', onDPChange.bind(null, scope, ngModel));

        scope.$watch (function () {
          return ngModel.$modelValue;
        });
      }
    };
  }]);

})(ALLEX.lib, angular.module ('allex_angularwebcomponent'));
