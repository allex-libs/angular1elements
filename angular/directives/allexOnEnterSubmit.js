(function (lib, module) {
  'use strict';

  function onEvent (el, submitselector, evnt) {
    if (evnt.which !== 13) return;
    evnt.preventDefault();
    var $el = $(submitselector);
    if (!$el.is (':visible') || $el.is(':disabled')) return;
    $el.click();
  }

  module.directive ('allexOnEnterSubmit', [function () {
    return {
      restrict : 'A',
      link : function (scope, el, attrs) {
        el.keypress(onEvent.bind(null, el, attrs.allexOnEnterSubmit));
      }
    };
  }]);
})(ALLEX.lib, angular.module ('allex_angularwebcomponent'));
