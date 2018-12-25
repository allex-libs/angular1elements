function createNotificatorPreprocessor (allex, applib, jqueryelementslib) {
  'use strict';
  var lib = allex.lib,
    BasicElement = applib.BasicElement,
    BasicModifier = applib.BasicModifier,
    BasicProcessor = applib.BasicProcessor,
    cntr = 0,
    misc = applib.misc,
    q = lib.q;


  function NotificatorPreprocessor () {
    BasicProcessor.call(this);
  }
  lib.inherit (NotificatorPreprocessor, BasicProcessor);

  NotificatorPreprocessor.prototype.process = function (desc) {
    throw new Error('Notificator Preprocessor is obsolete! Use AngularNotification.FromFunction instead');
    for (var element_name in this.config) {
      this.createNotificationElement (element_name, this.config[element_name], desc);
    }
  };

  function notificationFilter (ftion, data) {
    return {
      name : ftion,
      data : data
    };
  }

  NotificatorPreprocessor.prototype.createNotificationElement = function (name, config, desc) {
    var ftion;

    for (var i = 0; i<config.length; i++) {
      ftion = config[i];
      desc.links.push ({
        source : '.>'+ftion,
        target : name+':ftion',
        filter : notificationFilter.bind(null, ftion)
      });
    }
  };

  applib.registerPreprocessor('Notificator', NotificatorPreprocessor);
}

module.exports = createNotificatorPreprocessor;
