(function (lib, module) {
  'use strict';

  module.filter ('allexPrependFilter', function () {
    return function (input, minlen, prependWith){
      return lib.prependToString (prependWith || '0', minlen, input+'');
    };
  });
})(ALLEX.lib, angular.module('allex_angularwebcomponent'));
