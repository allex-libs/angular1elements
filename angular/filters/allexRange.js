(function (lib, module) {
  'use strict';
  function range (input, start, end, inc){
    start = parseFloat(start);
    end = parseFloat(end);
    inc = isNaN(inc) ? 1 : parseFloat(inc);

    for (var i = start; i < end; i+=inc){
      input.push(i);
    }
    return input;
  }

  module.filter ('allexRange' , function () { return range; });

})(ALLEX.lib, angular.module('allex_angularwebcomponent'));
