function createLib (execlib, applib, jqueryelementslib) {
  'use strict';

  var ANGULAR_REQUIREMENTS = new execlib.lib.Map();
  var angular_module = angular.module ('allex_angular1elementslib', []);

  var BasicAngularController = require('./controllers/basiccreator')(execlib);
  var basicControllers = require('./controllers/basicscreator')(execlib, BasicAngularController);
  var BasicAngularElement = require('./elements/basiccreator')(execlib, basicControllers, applib, jqueryelementslib);

  require('./resources/bootstrappercreator')(execlib, applib, ANGULAR_REQUIREMENTS);
  require('./elements/angularcreator')(execlib, basicControllers, BasicAngularElement, applib, angular_module);
  require('./elements/formlogiccreator')(execlib, basicControllers, BasicAngularElement, applib, angular_module);
  require('./elements/datatablecreator')(execlib, basicControllers, BasicAngularElement, ANGULAR_REQUIREMENTS, applib, jqueryelementslib, angular_module);
  require('./elements/notificationcreator')(execlib, basicControllers, BasicAngularElement, applib, angular_module);
  require('./modifiers/timeintervalcreator')(execlib, applib);
  require('./modifiers/datatableautoappendrowcreator')(execlib, applib);
  require('./preprocessors/notificatorcreator')(execlib, applib, jqueryelementslib);
  require('./preprocessors/angularcreator')(execlib, applib, ANGULAR_REQUIREMENTS);
  require('./preprocessors/notificationfromfunctioncreator')(execlib, applib);

  return {
    ANGULAR_REQUIREMENTS: ANGULAR_REQUIREMENTS,
    BasicAngularElement: BasicAngularElement,
    BasicAngularController: BasicAngularController
  };
}

module.exports = createLib;
