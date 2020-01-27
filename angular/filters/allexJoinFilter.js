(function (lib, module) {
  'use strict';

  module.filter ('allexJoinFilter', function () {

    function match (key, value_key, item, val) {
      if (val[key] === item) return val[value_key];
    }

    function resolve (references, key, val, item) {
      return lib.traverseConditionally (references, match.bind(null, key, val, item));
    }

    //try to optimize this input list ...
    return function (input, join, references, key, val, empty_string) {
      if (!lib.isArray(input)) return input;
      var ret = ((!references || !key || !val) ? input : input.map (resolve.bind(null, references, key, val))).join (lib.defined(join) ? join : ',');

      return ret.length === 0 && empty_string ? empty_string : ret;
    };
  });

})(ALLEX.lib, angular.module('allex_angularwebcomponent'));
