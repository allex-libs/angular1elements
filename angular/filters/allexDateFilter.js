(function (lib, module) {
  'use strict';

  module.filter ('allexDateFilter', function () {
    return function (input, format, parseFormat) {
      if (!input) return input;
      return moment(input, parseFormat).format(format);
    };
  });


})(ALLEX.lib, angular.module('allex_angularwebcomponent'));
