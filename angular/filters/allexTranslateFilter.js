//NISAM SIGURAN DA LI OVO IGDE KORISTIS ...
(function (lib, module) {
  'use strict';

  module.filter('allexTranslateFilter', function () {
    return function (input, remap) {
      if (!remap) return input;

      if (lib.isFunction (remap)) return remap(input);
      if (remap.hasOwnProperty(input)) return remap[input];
      return input;
    };
  });

})(ALLEX.lib, angular.module('allex_angularwebcomponent'));
