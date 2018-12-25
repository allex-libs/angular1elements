function createAngularNotificationFromFunctionPreprocessor (execlib, applib) {
  'use strict';

  var lib = execlib.lib,
    BasicProcessor = applib.BasicProcessor;

  /*
  * configuration is an array of objects.
  * A configuration object must have properties:
  * notification - the name of the notification (omit the 'element.', it will be prepended)
  * functions - an array of function configuration items
  *
  * Function configuration items may be:
  * Full form:
  * {
  *   source: <name of the source, omit '.>', it will be prepended>
  *   filter: {
  *     name: <function name for css-ing>
  *     onlyerror: true/false, false is assumed, will notify only on errors if true
  *   }
  * }
  */

  function AngularNotificationFromFunctionPreprocessor (options) {
    BasicProcessor.call(this, options);
  }
  lib.inherit(AngularNotificationFromFunctionPreprocessor, BasicProcessor);
  AngularNotificationFromFunctionPreprocessor.prototype.configure = function (config) {
    if (config && !lib.isArray(config)) {
      throw new Error ('AngularNotification.FromFunction Preprocessor expects the configuration to be an array of objects');
    }
    return BasicProcessor.prototype.configure.call(this, config);
  };
  AngularNotificationFromFunctionPreprocessor.prototype.process = function (desc) {
    if (!lib.isArray(this.config)) {
      return;
    }
    this.config.forEach(_processNotificationConfig.bind(null, desc));
  };
  function _processNotificationConfig (desc, conf) {
    console.log('AngularNotificationFromFunctionPreprocessor?', desc, conf);
    if (!lib.isArray(conf.functions)) {
      return;
    }
    conf.functions.forEach(_processNotificationFromFunctionLink.bind(null, desc, conf.notification));
  }
  function _processNotificationFromFunctionLink (desc, notificationname, ftiondesc) {
    var source = lib.isString(ftiondesc) ? ftiondesc : ftiondesc.source;
    desc.links.push({
      source: '.>'+source,
      target: 'element.'+notificationname+':ftion',
      filter: filterFunctionCreator(ftiondesc.filter, notificationname)
    });
  }
  function filterFunctionCreator(conf, name) {
    var _c = lib.extend({}, conf), _n = conf&&conf.name ? conf.name : name;
    return function (data) {
      if (_c.onlyerror && !data.error) {
        return;
      }
      return {
        name: _n,
        data: data
      };
    };
  }
  applib.registerPreprocessor ('AngularNotification.FromFunction', AngularNotificationFromFunctionPreprocessor);
}

module.exports = createAngularNotificationFromFunctionPreprocessor;
