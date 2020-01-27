function createAngularPreprocessor (allex, applib, ANGULAR_REQUIREMENTS) {
  'use strict';

  var lib = allex.lib,
    registerPreprocessor = applib.registerPreprocessor,
    BasicProcessor = applib.BasicProcessor,
    ANGULAR_REQUIREMENTS = new lib.Map();

  function AngularPreProcessor () {
    BasicProcessor.call(this);
  }

  lib.inherit (AngularPreProcessor, BasicProcessor);
  AngularPreProcessor.prototype.destroy = function () {
    BasicProcessor.prototype.destroy.call(this);
  };

  AngularPreProcessor.prototype.process = function (desc) {
    if (!desc) throw new Error('No APP descriptor');
    if (!desc.resources) {
      return;
      //desc.resources = [];
    }
    var resources = desc.resources, 
      angular_resource = null, 
      cnt = 0,
      i;
    for (i = 0; i < resources.length; i++) {

      if (resources[i].type === 'AngularBootstrapper') {
        if (cnt > 0) throw new Error('Multiple instances of AngularBootstrapper found, only one allowed');

        angular_resource = resources[i];
        cnt++;
      }
    }

    if (!angular_resource) {
      angular_resource = {
        type : 'AngularBootstrapper',
        //name : 'AngularBootstrapper', //not needed any more, especially for singleton Resources
        options : {
          angular_dependencies : []
        }
      };
      resources.push (angular_resource);
    }

    if (!angular_resource.options.angular_dependencies) angular_resource.options.angular_dependencies = [];

    var used_angular_elements = new lib.Map ();
    traverseElements (desc.elements, used_angular_elements);
    used_angular_elements.traverse (appendRequirements.bind(null, angular_resource.options.angular_dependencies));
    angular_resource.options.angular_dependencies = lib.arryOperations.unique (angular_resource.options.angular_dependencies);
  };

  function appendRequirements (dependencies, req, name) {
    Array.prototype.push.apply (dependencies, ANGULAR_REQUIREMENTS.get(name));
  }

  function traverseElements (elements, used_angular_elements) {
    if (!elements) return;
    for (var i = 0; i < elements.length; i++) {
      if (ANGULAR_REQUIREMENTS.get(elements[i].type) && !used_angular_elements.get(elements[i].type)){
        used_angular_elements.add(elements[i].type, true);
      }

      if (elements[i].options && elements[i].options.elements) traverseElements(elements[i].options.elements, used_angular_elements);
    }
  }

  registerPreprocessor ('AngularPreProcessor', AngularPreProcessor);
}

module.exports = createAngularPreprocessor;

