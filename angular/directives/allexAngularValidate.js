(function (lib, module) {
  'use strict';

  module.directive ('allexAngularValidate', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, el, attrs, ctrl) {


        var _ctrl = scope._ctrl;

        while (_ctrl) {
          if (lib.isFunction (_ctrl.validate)) break;
          _ctrl = _ctrl.scope.$parent ? _ctrl.scope.$parent._ctrl : undefined;
        }

        if (!_ctrl) {
          console.error('Unable to find validate function ...');
          return;
        }
        ctrl.$validators.allexAngularValidate = _ctrl.validate.bind(_ctrl, el.attr('name'));
      }
    };
  }]);
})(ALLEX.lib, angular.module ('allex_angularwebcomponent'));
