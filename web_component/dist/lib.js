angular.module ('allex_angularwebcomponent', []);


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

(function (lib, module) {
  'use strict';

  module.filter ('allexDateFilter', function () {
    return function (input, format, parseFormat) {
      if (!input) return input;
      return moment(input, parseFormat).format(format);
    };
  });


})(ALLEX.lib, angular.module('allex_angularwebcomponent'));

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

(function (lib, module) {
  'use strict';

  module.filter ('allexPrependFilter', function () {
    return function (input, minlen, prependWith){
      return lib.prependToString (prependWith || '0', minlen, input+'');
    };
  });
})(ALLEX.lib, angular.module('allex_angularwebcomponent'));

(function (lib, module) {
  'use strict';
  module.filter('allexPercentage', ['$filter', function ($filter) {
    return function (input, decimals) {
      return $filter('number')(input * 100, decimals) + '%';
    };
  }]);
})(ALLEX.lib, angular.module('allex_angularwebcomponent'));
