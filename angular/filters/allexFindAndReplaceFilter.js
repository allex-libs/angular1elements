(function (lib, module) {
  'use strict';

  module.filter ('allexFindAndReplaceFilter', function () {
    //references : array of objects
    //replace_key: find in references object with that key and given input as value
    //replace_with_key : return what was stored in replace_with_key

    return function (input, replace_key, replace_with_key, references) {
      var obj = lib.arryOperations.findElementWithProperty(references, replace_key, input);
      if (!obj) return input;
      return obj[replace_with_key];
    };
  });
})(ALLEX.lib, angular.module('allex_angularwebcomponent'));
