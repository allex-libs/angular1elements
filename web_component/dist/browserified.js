(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
ALLEX.execSuite.libRegistry.register('allex_angular1elementslib',require('./libindex')(ALLEX, ALLEX.execSuite.libRegistry.get('allex_applib'), ALLEX.execSuite.libRegistry.get('allex_jqueryelementslib'), ALLEX.execSuite.libRegistry.get('allex_formvalidationlib')));

},{"./libindex":8}],2:[function(require,module,exports){
function createBasicAngularController (execlib) {
  'use strict';

  var lib = execlib.lib,
    CLDestroyable = lib.CLDestroyable;

  var requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(/* function */ callback, /* DOMElement */ element){
    window.setTimeout(callback, 1000 / 60);
    };
  })();

  var _dirtys = [];

  function addDirty (d) {
    _dirtys.push(d);
    if(_dirtys.length===1){
      requestAnimFrame(_doUndirty);
    }
  }

  function _doUndirty() {
    var d = _dirtys;
    _dirtys = [];
    while (d.length) {
      d.shift()._unDirty();
    }
  }


  function BasicAngularController ($scope) {
    CLDestroyable.call(this);
    this.scope = $scope;
    this.scope._ctrl = this;
    this.dirty = false;
    this._off = this.scope.$on('$destroy', this.destroy.bind(this));
  }

  lib.inherit(BasicAngularController, CLDestroyable);
  BasicAngularController.prototype.__cleanUp = function () {
    if ('function' === typeof(this._off)) this._off();
    this._off = null;
    this.scope._ctrl = null;
    this.scope = null;
    this.dirty = null;
    CLDestroyable.prototype.__cleanUp.call(this);
  };

  BasicAngularController.prototype.$digest = function () {
    ///safe digest on scope ....
    if (!this.scope) return;
    if (!this.scope.$$phase) this.scope.$digest();
  };
  BasicAngularController.prototype.$apply = function () {
    ///safe apply on scope ...
    if (!this.scope) return;
    if (this.dirty) return;
    //console.log('dirty-ing', this.scope.$id);
    this.dirty = true;
    this._real$apply();

    if (this.dirty) {
      addDirty(this);
    }
  };

  BasicAngularController.prototype._unDirty = function () {
    if (this.dirty !== true) {return;}
    //console.log('_unDirty-ing', this.scope.$id);
    this._real$apply();
  };
  BasicAngularController.prototype.set = function () {
    CLDestroyable.prototype.set.apply(this, arguments);
    this.$apply();
  };

  BasicAngularController.prototype._real$apply = function () {
    if (!this.scope) return;
    if (!this.dirty) return;

    if (!this.scope.$$phase && !this.scope.$root.$$phase) {
      this.dirty = false;
      this.scope.$apply();
    }else{
      //console.log('re-dirty-ing', this.scope.$id);
      this.dirty = true;
      addDirty(this);
    }
  };

  return BasicAngularController;
}

module.exports = createBasicAngularController;

},{}],3:[function(require,module,exports){
function createBasicAngularControllers (execlib, BasicAngularController) {
  'use strict';

  var lib = execlib.lib;

  function BasicAngularElementController ($scope) {
    BasicAngularController.call(this, $scope);
    this.raise = null;
    this._getResource = null;
  }
  lib.inherit (BasicAngularElementController, BasicAngularController);
  BasicAngularElementController.prototype.__cleanUp = function () {
    this.raise = null;
    this._getResource = null;
    BasicAngularController.prototype.__cleanUp.call(this);
  };

  BasicAngularElementController.prototype.getResource = function (name) {
    return this._getResource ? this._getResource(name) : undefined;
  };

  BasicAngularElementController.prototype.elementReady = function ($el) {
    var elc = $el.data('allex_element');
    if (!elc) throw new Error('Missing allex element ...');
    elc.set('$scopectrl', this);
  };

  BasicAngularElementController.prototype.raiseEvent = function (name, val) {
    this.raise(name, val);
  };

  function AngularDataAwareController ($scope) {
    BasicAngularElementController.call(this,$scope);
    this.data = null;
  }
  lib.inherit(AngularDataAwareController, BasicAngularElementController);
  AngularDataAwareController.prototype.__cleanUp = function () {
    this.data = null;
    BasicAngularElementController.prototype.__cleanUp.call(this);
  };

  AngularDataAwareController.prototype.set_data = function (data) {
    if (this.data === data) return false;
    this.data = data;
    return true;
  };

  return {
    AngularDataAwareController: AngularDataAwareController,
    BasicAngularElementController: BasicAngularElementController
  };
}

module.exports = createBasicAngularControllers;

},{}],4:[function(require,module,exports){
function createAngularElement (execlib, basicControllers, BasicAngularElement, applib, angular_module) {
  'use strict';
  //use this if you want simply to use angular mechanism in any DOM element ....

  var lib = execlib.lib,
    AngularDataAwareController = basicControllers.AngularDataAwareController,
    q = lib.q;

    ///This is allexApp part of code ....
    function AngularElement (id, options) {
      BasicAngularElement.call(this, id, options);
    }
    lib.inherit (AngularElement, BasicAngularElement);

    AngularElement.prototype.__cleanUp = function () {
      BasicAngularElement.prototype.__cleanUp.call(this);
    };

    AngularElement.prototype.initialize = function () {
      BasicAngularElement.prototype.initialize.call(this);
      this.$element.attr('data-allex-angular-element', '');
    };

    applib.registerElementType('AngularElement', AngularElement);

    angular_module.controller('allexAngularElementController', ['$scope', function ($scope) {
      new AngularDataAwareController($scope);
    }]);

    angular_module.directive ('allexAngularElement', [function () {
      return {
        restrict : 'A',
        scope: true,
        controller: 'allexAngularElementController',
        link : function ($scope, $el, $attribs) {
          $scope._ctrl.elementReady ($el);
        }
      };
    }]);

    function AngularFormElement(id, options) {
      BasicAngularElement.call(this, id, options);
    }
    lib.inherit(AngularFormElement, BasicAngularElement);
    AngularFormElement.prototype.set_data = function (val) {
      var ret = BasicAngularElement.prototype.set_data.call(this, val),
        parentscopectrl, myname;

      if (ret !== false) {
        parentscopectrl = this.__parent.$scopectrl;
        myname = this.$element.attr('name');
        if (parentscopectrl && myname) {
          if (parentscopectrl.data) {
            parentscopectrl.data[myname] = val;
          }else{
            var dd = {};
            dd[myname] = val;
            parentscopectrl.set('data', dd);
          }
        }
      }
      return ret;
    };
    applib.registerElementType('AngularFormElement', AngularFormElement);
}

module.exports = createAngularElement;

},{}],5:[function(require,module,exports){
function createBasic(allex, basicControllers, applib, jqueryelementslib) {
  'use strict';

  var lib = allex.lib,
    BasicAngularController = lib.BasicAngularController,
    WebElement = applib.getElementType('WebElement'),
    DataElementMixin = applib.mixins.DataElementMixin,
    q = lib.q;

    function BasicAngularElement (id, options) {
      WebElement.call(this, id, options);
      DataElementMixin.call(this);
      this.q = new lib.Fifo();
      this._addHook('onAngularReady');
      this.$scopectrl = null;
      if (options && options.initialData) this.set('data', options.initialData);
    }
    lib.inherit (BasicAngularElement, WebElement);
    DataElementMixin.addMethods(BasicAngularElement);
    BasicAngularElement.prototype.__cleanUp = function () {
      this.$scopectrl = null;
      if (this.q) {
        this.q.destroy();
      }
      this.q = null;
      DataElementMixin.prototype.__cleanUp.call(this);
      WebElement.prototype.__cleanUp.call(this);
    };

    BasicAngularElement.prototype.getArrayDataCopy = function () {
      var data = this.get('data');
      return data ? data.slice() : null;
    };

    BasicAngularElement.prototype.getHashDataCopy = function () {
      return lib.extend ({}, this.get('data'));
    };

    BasicAngularElement.prototype.set_$scopectrl = function (val) {
      this.$scopectrl = val;
      this._onScope(val);
      this._setRaise();
      this.fireHook('onAngularReady', [this]);
      this.q.drain(this.executeOnScopeer.bind(this));
      //console.log('E, OD SAD MOZE NESTO DA SE RADI!', this.get('data'), this.data);
      //this.$scopectrl.set('data', this.get('data'));
      //this.$scopectrl.set('data', this.data);
    };

    /*
    BasicAngularElement.prototype.isScopeReady = function () {
      var ret = !!this.$scopectrl;
      if (!ret) {
        console.warn(this.constructor.name, 'still has no $scopectrl');
      }
      return ret;
    };
    */

    BasicAngularElement.prototype.executeOnScopeer = function (qelem) {
      this.executeOnScope(qelem[0], qelem[1]);
    };
    BasicAngularElement.prototype.executeOnScope = function (method, args) {
      if (!this.$scopectrl) {
        this.q.push([method, args]);
        return;
      }
      var fc = lib.readPropertyFromDotDelimitedString (this.$scopectrl, method, true);
      fc.val.apply(fc.ctx, args);
    };

    BasicAngularElement.prototype._setRaise = function () {
      this.$scopectrl.set('raise', this.raiseEvent.bind(this));
      this.$scopectrl.set('_getResource', this.getResource.bind(this));
    };

    BasicAngularElement.prototype.set_data = function (val) {
      var ret = DataElementMixin.prototype.set_data.call(this, val);
      if (DataElementMixin.prototype.hasDataChanged.call(this, ret)){
        this.executeOnScope ('set', ['data', this.data]);
      }
      return ret;
    };

    BasicAngularElement.prototype.getMeAsElement = function () {
      return this.$element;
    };

    BasicAngularElement.prototype.initialize = function () {
      WebElement.prototype.initialize.call(this);
      this.$element.data('allex_element', this);
      this.attachHook('onAngularReady', this.getConfigVal('onAngularReady'));
    };

    BasicAngularElement.prototype.$apply = function () {
      if (!this.$scopectrl) return;
      this.$scopectrl.$apply();
    };

    BasicAngularElement.prototype._onScope = lib.dummyFunc;
    return BasicAngularElement;
}

module.exports = createBasic;

},{}],6:[function(require,module,exports){
function createAngularFormLogic (execlib, basicControllers, BasicAngularElement, applib, jqueryelementslib, formvalidationlib, angular_module) {
  'use strict';

  ///MIND THE FACT that form name should not contain - in their name ... for example form-bla will not work ... inspect that ...

  var lib = execlib.lib,
    BasicAngularElementController = basicControllers.BasicAngularElementController,
    FormMixin = jqueryelementslib.mixins.form.Logic,//applib.mixins.FormMixin,
    q = lib.q,
    BasicModifier = applib.BasicModifier,
    FormValidatorMixin = formvalidationlib.mixins.FormValidator,
    BRACKET_END = /\[\]$/;

  function AngularFormLogic(id, options) {
    BasicAngularElement.call(this, id, options);
    FormMixin.call(this, options);
    this._valid_l = null;
    this._validfields_l = {};
  }

  lib.inherit (AngularFormLogic, BasicAngularElement);
  FormMixin.addMethods(BasicAngularElement);
  AngularFormLogic.prototype.__cleanUp = function () {
    lib.traverseShallow(this._validfields_l, this._unlisten.bind(this));
    if (this._valid_l) this._valid_l.destroy();
    this._valid_l = null;
    FormMixin.prototype.destroy.call(this);
    BasicAngularElement.prototype.__cleanUp.call(this);
  };

  AngularFormLogic.prototype.set_ftion_status = function (val) {
    var ret = FormMixin.prototype.set_ftion_status.call(this, val);
    this.executeOnScope ('set', ['ftion_status', val]);
  };

  AngularFormLogic.prototype.doCloseOnSuccess = function (val) {
    FormMixin.prototype.doCloseOnSuccess.call(this, val);
    this.executeOnScope ('set', ['disabled', false]);
  };

  AngularFormLogic.prototype.set_progress = function (val) {
    var ret = FormMixin.prototype.set_progress.call(this, val);
    if (ret) {
      this.executeOnScope ('set', ['progress', val]);
    }
    return ret;
  };

  AngularFormLogic.prototype._unlisten = function (f) {
    if (lib.isFunction (f)) f();
  };

  AngularFormLogic.prototype.set_actual = function (val) {
    BasicAngularElement.prototype.set_actual.call(this, val);
    FormMixin.prototype.set_actual.call(this, val);
    this.executeOnScope ('set', ['disabled', !val]);
    return true;
  };

  AngularFormLogic.prototype.initialize = function () {
    BasicAngularElement.prototype.initialize.call(this);
    FormMixin.prototype.initialize.call(this);
    this.$element.attr ({ 'data-allex-angular-form-logic': ''});
  };

  AngularFormLogic.prototype._prepareField = function ($el) {
    var name = $el.attr('name'),
      model_name = this.getModelName(name);

    if (!model_name) {
      console.warn ('There is no name for input field ', $el, 'form logic', this.get('id'));
      return;
    }

    var old_read_only = $el.attr('data-ng-readonly'),
      new_read_only = old_read_only && old_read_only.length ? '('+old_read_only+') ||' : '';

    new_read_only += '(_ctrl.disabled || _ctrl.progress)';

    $el.attr({
      'data-allex-angular-validate' : '_ctrl.validation.'+model_name,
      'data-ng-change' : '_ctrl.onChange(\''+model_name+'\', _ctrl.data.'+model_name+')'
    });

    if (!$el.attr('readonly')){
      $el.attr('data-ng-readonly',new_read_only);
    }

    if (!$el.attr('data-ng-model') && !$el.attr('ng-model')) {
      $el.attr('data-ng-model', '_ctrl.data.'+model_name);
    }

    this._validfields_l[model_name] = null;
  };

  AngularFormLogic.prototype.set_data = function (data) {
    FormMixin.prototype.fillObjectWithDefaultValues(data);
    return BasicAngularElement.prototype.set_data.call(this, data);
  };

  AngularFormLogic.prototype.get_data = function () {
    return this.$scopectrl ? this.$scopectrl.get('data') : this.data;
  };

  AngularFormLogic.prototype.getModelName = function (name) {
    var model_name = name;
    if(name.match (BRACKET_END)){
      model_name = name.replace(BRACKET_END, '');
    }
    return model_name;
  };

  AngularFormLogic.prototype.revalidate = function () {
    if (!this.$scopectrl) return;
    var form = this.$scopectrl.scope[this.id];
    if (!form) return;

    for (var i in this.validfields) {
      if (!form[i]) continue;
      form[i].$validate();
    }
  };

  AngularFormLogic.prototype._onScope = function (ctrl) {
    this._valid_l = ctrl.attachListener('valid', this.set.bind(this, 'valid'));
    ctrl.set('validation', this.getConfigVal('validation'));
    ctrl.set('confirmationfields', this.getConfigVal('confirmationfields'));
    ctrl.set('_onChange', this._onChanged.bind(this));
    lib.traverseShallow (this._validfields_l, this._watchForValid.bind(this, ctrl.scope, this.$form.attr('name')));
    ctrl.set('config', this.getConfigVal('form'));
    ctrl.set('progress', this.get('progress'));
    ctrl.set('ftion_status', this.get('ftion_status'));
    ctrl.set('disabled', !this.get('actual'));
    if (this.initial) lib.runNext(this._setInitial.bind(this));
  };

  AngularFormLogic.prototype._watchForValid = function (scope, formname, val, key) {
    this._validfields_l[key] = scope.$watch('_ctrl.data.'+key, this._updateError.bind(this, scope, formname, key));
  };
  AngularFormLogic.prototype._updateError = function (scope, formname, key) {
    var s = lib.extend({}, this.validfields);
    if (!scope[formname][key]){
      console.warn ('no '+key+' in validator');
      return;
    }
    s[key] = !Object.keys(scope[formname][key].$error).length;
    this.set('validfields', s);
  };

  AngularFormLogic.prototype.isFieldValid = function (field) {
    return this.$scopectrl && this.$scopectrl.scope[this.get('id')] ? this.$scopectrl.scope[this.get('id')][field].$valid : false;
  };

  AngularFormLogic.prototype.setInputEnabled = function (fieldname, enabled) {
    var $el = FormMixin.prototype.setInputEnabled.call(this, fieldname, enabled);
    if ($el) {
      $el.attr('data-ng-disabled', enabled ? "false" : "true");
    }
    this.executeOnScope ('$apply');
  };


  applib.registerElementType ('AngularFormLogic', AngularFormLogic);

  function AllexAngularFormLogicController ($scope) {
    BasicAngularElementController.call(this, $scope);
    FormValidatorMixin.call(this);
    this.data = {};
    this.valid = false;
    this._watcher = null;
    this._onChange = null;
    this.config = null;
    this.progress = null;
    this.ftion_status = null;
    this.disabled = false;
  }
  lib.inherit(AllexAngularFormLogicController, BasicAngularElementController);
  FormValidatorMixin.addMethods(AllexAngularFormLogicController);
  AllexAngularFormLogicController.prototype.__cleanUp = function () {
    this.disabled = null;
    this.ftion_status = null;
    this.progress = null;
    if (this._watcher) this._watcher();
    this._watcher = null;
    this.data = null;
    this.valid = null;
    this._onChange = null;
    this.config = null;
    FormValidatorMixin.prototype.destroy.call(this);
    BasicAngularElementController.prototype.__cleanUp.call(this);
  };

  AllexAngularFormLogicController.prototype.onChange = function (name, val){
    if (lib.isFunction(this._onChange)) this._onChange(this.data, name, val);
  };

  AllexAngularFormLogicController.prototype.elementReady = function ($el) {
    BasicAngularElementController.prototype.elementReady.call(this, $el);
    this._watcher = this.scope.$watch ($el.attr('allexid')+'.$valid', this.set.bind(this, 'valid'));
  };

  AllexAngularFormLogicController.prototype.set_valid = function (val) {
    if (this.valid === val) return false;
    this.valid = val || null;
    return true;
  };

  AllexAngularFormLogicController.prototype.validate = function (name, modelValue, viewValue) {
    return FormValidatorMixin.prototype.validateFieldNameWithValue.call(this, name, modelValue);
  };

  angular_module.controller('allexAngularFormLogicController', ['$scope', function ($scope) {
    new AllexAngularFormLogicController($scope);
  }]);

  angular_module.directive ('allexAngularFormLogic', function () {
    return {
      restrict : 'A',
      scope: true,
      controller : 'allexAngularFormLogicController',
      link : function ($scope, $el, $attribs) {
        $scope._ctrl.elementReady($el);
      }
    };
  });

  function SubmissionModifier (options) {
    BasicModifier.call(this, options);
  }

  lib.inherit (SubmissionModifier, BasicModifier);
  SubmissionModifier.prototype.destroy = function () {
    BasicModifier.prototype.destroy.call(this);
  };

  function createSubmissionTriggers(item) {
    return item.ftion;
  }

  ///FALI TI DEFAULT_CONFIG i ostalo za validaciju options -a ...

  SubmissionModifier.prototype.doProcess = function (name, options, links, logic, resources) {
    var form = this.getConfigVal('form'),
      cbs = this.getConfigVal('cbs');
     

    if (!form) throw new Error ('No form in SubmissionModifier');
    if (!cbs) throw new Error ('No cbs in SubmissionModifier');

    logic.push ({
        triggers : form+'!submit',
        references : ([form].concat(cbs.map (createSubmissionTriggers))).join (','),
        handler : this._onSubmit.bind(this, cbs)
    });

    var form_progress = form+':progress',
      ftion_status = form+':ftion_status';

    for (var i = 0; i < cbs.length; i++) {
      links.push ({
        source : cbs[i].ftion,
        target : form_progress,
        filter : this._processProgress.bind(this)
      },{
        source : cbs[i].ftion,
        target : ftion_status,
        filter : this._processStatus.bind(this)
      });
    }
  };

  SubmissionModifier.prototype._onSubmit = function (cbs, form) {
    //TODO: ovde moras nekako da handlujes throw koji je podagao neki od filtera ....
    var len = cbs.length,
      offset = 2,
      frefs = Array.prototype.slice.call (arguments, offset, cbs.length+offset),
      data = arguments[offset+cbs.length];


    for (var i = 0; i < len; i++) {
      if (cbs[i].conditional && !cbs[i].conditional(data)) continue;
      frefs[i](lib.isFunction(cbs[i].filter) ?  cbs[i].filter(data, form) : [data]);
    }
  };

  SubmissionModifier.prototype._processFilter = function (filter) {
  };

  SubmissionModifier.prototype._processProgress = function (progress) {
    return progress && progress.working && progress.progress;
  };

  SubmissionModifier.prototype._processStatus = function (sttus) {
    if (!sttus || sttus.working) return null;
    if (sttus.error) return {error : sttus.error};
    if (sttus.result)return {result:sttus.result};

    return null;
  };
  SubmissionModifier.prototype.DEFAULT_CONFIG = function() {
    return null;
  };

  applib.registerModifier('SubmissionModifier', SubmissionModifier);

  function FieldBindingModifier (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit (FieldBindingModifier, BasicModifier);
  FieldBindingModifier.prototype.destroy = function () {
    BasicModifier.prototype.destroy.call(this);
  };
  FieldBindingModifier.ALLOWED_ON = ['AngularFormLogic'];

  FieldBindingModifier.prototype._prepareItem = function (name, options, links, logic, resources, data) {
    var path = data.path, field = data.field;

    if (!field) throw new Error('No field given in FieldBindingModifier '+name);

    if (!path) path = name+'_partialSubmit_'+field;

    links.push (
    {
      source: '.:actual',
      target: path+':actual'
    });

    logic.push (
    {
      triggers : ['.:actual', '.:data'],
      references : '., '+path,
      handler : this._decide.bind(this, field)
    },
    {
      triggers : path+'.$element!click',
      references : '.',
      handler : this._onTrigger.bind(this, field)
    });

  };

  FieldBindingModifier.prototype.doProcess = function (name, options, links, logic, resources) {

    var list = this.getConfigVal ('list');
    if (lib.isArray(list)) {
      list.forEach (this._prepareItem.bind(this, name, options, links, logic, resources));
      return;
    }

    var path = this.getConfigVal('path'), field = this.getConfigVal('field');
    if (field) this._prepareItem (name, options, links, logic, resources, {path : path, field : field});
  };

  FieldBindingModifier.prototype._decide = function (field, form, el) {
    ///neka ga ovako za sad ...
    el.$element.attr('disabled', form.isFieldValid(field) ? null : 'disabled');
  };

  FieldBindingModifier.prototype._onTrigger = function (field, form) {
    form.firePartialSubmit(field);
  };

  FieldBindingModifier.prototype.DEFAULT_CONFIG = function () {
    return null;
  };

  applib.registerModifier ('AngularFormLogic.bindField', FieldBindingModifier);
}

module.exports = createAngularFormLogic;

},{}],7:[function(require,module,exports){
function createAngularNotificationElement (allex, basicControllers, BasicAngularElement, applib, angular_module) {
  'use strict';
  var lib = allex.lib,
    BasicAngularElementController = basicControllers.BasicAngularElementController,
    q = lib.q,
    BasicModifier = applib.BasicModifier;

  function AngularNotification (id, options) {
    BasicAngularElement.call(this, id, options);
    this.data = null;
    this._temp_cache = null;
  }
  lib.inherit (AngularNotification, BasicAngularElement);

  AngularNotification.prototype.__cleanUp = function () {
    if (this._temp_cache) this._temp_cache.destroy();
    this._temp_cache = null;
    this.data = null;
    BasicAngularElement.prototype.__cleanUp.call(this);
  };

  AngularNotification.prototype._processToCache = function (regexp, item) {
    var id = $(item).attr('id');
    if (!id.match (regexp) || this.isDefaultTemplate(id)) return;

    this._addToCache(item, id);
    $(item).remove();
  };

  AngularNotification.prototype._addToCache = function (item, id) {
    if (item.length === 0) throw new Error ('Unable to find item '+id);
    if (!id) {
      id = $(item).attr('id');
    }
    if (!this._temp_cache) this._temp_cache = new lib.Map ();
    this._temp_cache.add(id, $(item).html());
  };

  AngularNotification.prototype._addToCacheFromParentDiv = function (parentdivid, childdivid) {
    return this._addToCache($('#'+parentdivid+' #'+childdivid), childdivid);
  };

  AngularNotification.prototype.isDefaultTemplate = function (id) {
    var dt = this.getConfigVal ('defaultTemplate');
    if (!dt) return false;
    return (id === dt.error || id === dt.success || id === dt.progress);
  };

  AngularNotification.prototype.initialize = function () {
    BasicAngularElement.prototype.initialize.call(this);
    var regexp = new RegExp ('^'+'angular_notification_'+this.get('id'));
    $('#references').children().toArray().forEach (this._processToCache.bind(this, regexp));
    var default_templates = this.getConfigVal('defaultTemplate');
    if (default_templates) {
      if (default_templates.error) this._addToCacheFromParentDiv ('references',default_templates.error);
      if (default_templates.success) this._addToCacheFromParentDiv ('references',default_templates.success);
      if (default_templates.progress) this._addToCacheFromParentDiv ('references',default_templates.progress);
    }

    this.$element.attr({
      'allex-notification' : ''
    });

    this.$element.find(this.getConfigVal('contentSelector')).attr('data-ng-include', '_ctrl.html');
  };

  AngularNotification.prototype.set_actual = function (val) {
    BasicAngularElement.prototype.set_actual.call(this, val);
    var f = this.getConfigVal('setActual');
    if (!lib.isFunction(f)) return;
    f(this.$element, val);
  };

  AngularNotification.prototype.templateName = function (name) {
    return '#references #angular_notification_'+this.get('id')+'_'+name;
  };


  AngularNotification.prototype.findTemplate = function (name) {
    var ret = $(this.templateName(name));
    return ret.length ? ret : null;
  };

  AngularNotification.prototype.set_data = function (data) {
    if (this.data === data) return false;
    this.data = data;

    var default_template;

    if (!this.data) {
      this._doHide();
      return;
    }

    var template = this.templateName(data.name);

    if (!this.$scopectrl.$templateCache.get(this.templateName(data.name))) {
      template = this.getConfigVal('defaultTemplate') ? this.getConfigVal('defaultTemplate')[data.type] : null;
      if (!template) return;

      template = '#references #'+template; //samo
    }

    this.$scopectrl.html = template;
    this.$scopectrl.notificationClass = data.notificationClass || null;
    this.$scopectrl.title = data.title || null;
    this.$scopectrl.set('data', data.content_data);
    this.set('actual', true);
  };

  AngularNotification.prototype._doHide = function () {
    this.$scopectrl.set('data', null);
    this.set('actual', false);
  };

  AngularNotification.prototype.set_ftion = function (data) {
    if (!data || (!data.data.error && !data.data.progress && !data.data.result)) return; //nothing to be done ...

    var notificationClass = null, 
      fconf = this.getConfigVal ('functionConfigs'),
      title = null,
      name = null,
      content_data = null,
      statusClass = null;

    if (data.data.error) {
      content_data = data.data.error;
      name = data.name+'_error';
      title = this.getConfigVal('defaultErrorTitle');
      statusClass = 'error';
    }
    else if (data.data.result) {
      content_data = data.data.result;
      name = data.name+'_success';
      title = this.getConfigVal ('defaultSuccessTitle');
      statusClass = 'success';
    }
    else if (data.data.progress) {
      content_data = data.data.progress;
      name = data.name+'_progress';
      title = this.getConfigVal('defaultProgressTitle');
      statusClass = 'progress';
      if (!data.data.running) {
        console.log('got progress, but not running', data);
        return;
      }
    }

    if (fconf && fconf[name]){
      notificationClass = fconf.notificationClass;
      title = fconf.title;
    }

    notificationClass = (notificationClass || '')+' '+statusClass;
    this.set('data', {name : name, content_data : content_data, notificationClass : notificationClass, title : title, type : statusClass});
  };

  function _toTemplateCache (anc, item, key) {
    anc.$scopectrl.$templateCache.put ('#references #'+key, item);
  }

  AngularNotification.prototype._onScope = function (ctrl) {
    if (!this._temp_cache) return;
    this._temp_cache.traverse (_toTemplateCache.bind(null, this));
    this._temp_cache.destroy();
    this._temp_cache = null;
  };

  applib.registerElementType ('AngularNotification', AngularNotification);

  function AngularNotificationController ($scope, $templateCache) {
    BasicAngularElementController.call(this,$scope);
    this.$templateCache = $templateCache;
    this.content_container = null;
    this.html = null;
    this.data = null;
    this.title = null;
    this.notificationClass = null;
  }
  lib.inherit(AngularNotificationController, BasicAngularElementController);
  AngularNotificationController.prototype.__cleanUp = function () {
    this.content_container = null;
    this.html = null;
    this.$templateCache = null;
    this.title = null;
    this.notificationClass = null;
    this.data = null;
    BasicAngularElementController.prototype.__cleanUp.call(this);
  };

  AngularNotificationController.prototype.set_content_container = function ($el) {
    this.content_container = $el;
  };

  angular_module.controller ('allexNotificationController', ['$scope', '$templateCache', function ($scope, $templateCache) {
    new AngularNotificationController ($scope, $templateCache);
  }]);

  angular_module.directive ('allexNotification', [function () {
    return {
      restrict : 'A',
      scope : true,
      controller : 'allexNotificationController',
      link : function ($scope, $el) {
        $scope._ctrl.elementReady($el);
      }
    };
  }]);


  function BootstrapModalModifier (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit (BootstrapModalModifier, BasicModifier);

  BootstrapModalModifier.prototype.destroy = function (){
    BasicModifier.prototype.destroy.call(this);
  };

  BootstrapModalModifier.prototype.doProcess = function (name, options, links, logic, resources) {
    if (!options.contentSelector) options.contentSelector = '.modal-body';
    this.hookToArray(options, 'onActual', this._onActual.bind(this));
    this.hookToArray (options,'onInitialized', this._onIntialized.bind(this));
  };

  BootstrapModalModifier.prototype._onActual = function (el, actual) {
    el.$element.modal(actual ? 'show': 'hide');
  };

  BootstrapModalModifier.prototype._onIntialized = function (el){
    el.$element.on ('shown.bs.modal', el.set.bind(el, 'actual', true));
    el.$element.on ('hidden.bs.modal', el.set.bind(el, 'actual', false));
  };

  BootstrapModalModifier.prototype.ALLOWED_ON = ['AngularNotification', 'AngularFormLogic'];
  BootstrapModalModifier.prototype.DEFAULT_CONFIG = function () {return null;};
  applib.registerModifier ('AngularElements.BootstrapModal', BootstrapModalModifier);

}

module.exports = createAngularNotificationElement;

},{}],8:[function(require,module,exports){
function createLib (execlib, applib, jqueryelementslib, formvalidationlib) {
  'use strict';

  var ANGULAR_REQUIREMENTS = new execlib.lib.Map();
  var angular_module = angular.module ('allex_angular1elementslib', []);

  var BasicAngularController = require('./controllers/basiccreator')(execlib);
  var basicControllers = require('./controllers/basicscreator')(execlib, BasicAngularController);
  var BasicAngularElement = require('./elements/basiccreator')(execlib, basicControllers, applib, jqueryelementslib);

  require('./resources/bootstrappercreator')(execlib, applib, ANGULAR_REQUIREMENTS);
  require('./elements/angularcreator')(execlib, basicControllers, BasicAngularElement, applib, angular_module);
  require('./elements/formlogiccreator')(execlib, basicControllers, BasicAngularElement, applib, jqueryelementslib, formvalidationlib, angular_module);
  require('./elements/notificationcreator')(execlib, basicControllers, BasicAngularElement, applib, angular_module);
  require('./modifiers/timeintervalcreator')(execlib, applib);
  require('./preprocessors/notificatorcreator')(execlib, applib, jqueryelementslib);
  require('./preprocessors/angularcreator')(execlib, applib, ANGULAR_REQUIREMENTS);
  require('./preprocessors/notificationfromfunctioncreator')(execlib, applib);

  return {
    ANGULAR_REQUIREMENTS: ANGULAR_REQUIREMENTS,
    BasicAngularElement: BasicAngularElement,
    BasicAngularController: BasicAngularController,
    BasicAngularElementController: basicControllers.BasicAngularElementController,
    AngularDataAwareController: basicControllers.AngularDataAwareController
  };
}

module.exports = createLib;

},{"./controllers/basiccreator":2,"./controllers/basicscreator":3,"./elements/angularcreator":4,"./elements/basiccreator":5,"./elements/formlogiccreator":6,"./elements/notificationcreator":7,"./modifiers/timeintervalcreator":9,"./preprocessors/angularcreator":10,"./preprocessors/notificationfromfunctioncreator":11,"./preprocessors/notificatorcreator":12,"./resources/bootstrappercreator":13}],9:[function(require,module,exports){
function createTimeIntervalModifier (execlib, applib) {
  'use strict';
  var lib = execlib.lib,
    BasicModifier = applib.BasicModifier,
    misc = applib.misc;


  function TimeInterval (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit (TimeInterval, BasicModifier);
  TimeInterval.prototype.ALLOWED_ON = function () {
    return 'AngularFormLogic';
  };

  TimeInterval.prototype.DEFAULT_CONFIG = function () {
    return null;
  };

  TimeInterval.prototype.doProcess = function (name, options, links, logic, resources) {
    misc.addHook (options, 'onInitialized', this._onInitialized.bind(this, this.config));
  };

  TimeInterval.prototype._onInitialized = function (config, el) {
    var $element = el.$element,
      $from = $element.find (config.from),
      $to = $element.find(config.to),
      from_options = lib.extend({}, config.options),
      to_options = lib.extend({}, config.options);

    from_options.maxDate = moment();
    to_options.maxDate = moment();


    if (config.maxDateOffset) {
      from_options.maxDate.add.apply(from_options.maxDate, config.maxDateOffset);
      to_options.maxDate.add.apply(to_options.maxDate, config.maxDateOffset);
    }

    $from.datetimepicker(from_options);
    $to.datetimepicker(to_options);

    $from.on('dp.change', this._onFromChanged.bind(this, config, el, $to, $from));
    $to.on ('dp.change', this._onToChanged.bind(this, config, el, $to, $from));
    $to.on ('dp.show', this._onToShowEvent.bind(this, config, el, $to, $from));
    $from.on('dp.show', this._onFromShowEvent.bind(this, config, el, $to, $from));
  };

  TimeInterval.prototype._onFromShowEvent = function (config, el, $to, $from, evnt) {
    var dtp = $from.data('DateTimePicker'),
      current = dtp.date();
    this._onFromChanged (config, el, $to, $from, {date : current});
  };

  TimeInterval.prototype._onToShowEvent = function (config, el, $to, $from, evnt) {
    var new_default = moment();
    if (config.maxDateOffset) {
      new_default = new_default.add.apply (new_default, config.maxDateOffset);
    }
    $to.data('DateTimePicker').maxDate(new_default);
    var current = $to.data('DateTimePicker').date();
    this._onToChanged (config, el, $to, $from, {date : current});
  };

  TimeInterval.prototype._onToChanged = function (config, el, $to, $from, evnt) {
    var date = evnt.date ? evnt.date.format(config.options.format) : null;
    el.updateHashField ($to.find('input').attr('name'), date);
    $from.data('DateTimePicker').maxDate(date ? moment(date, config.options.format) : moment());
  };

  TimeInterval.prototype._onFromChanged = function (config, el, $to, $from, evnt) {
    el.updateHashField ($from.find('input').attr('name'), evnt.date ? evnt.date.format(config.options.format) : null);
  };

  applib.registerModifier ('TimeInterval', TimeInterval);

  function TimeIntervalReset (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit (TimeIntervalReset, BasicModifier);
  TimeIntervalReset.prototype.DEFAULT_CONFIG = function () {
    return null;
  };
  TimeIntervalReset.prototype.ALLOWED_ON = function () {
    return 'AngularFormLogic';
  };

  TimeIntervalReset.prototype.doProcess = function (name, options, links, logic, resources) {
    logic.push ({
      triggers : '.'+this.getConfigVal('trigger')+'.$element!click',
      references : '.',
      handler : this._onResetRequested.bind(this, this.config)
    });
  };

  TimeIntervalReset.prototype._onResetRequested = function (config, el) {
    config.elements.forEach (this._resetOnField.bind(this, el));
  };

  TimeIntervalReset.prototype._resetOnField = function (el, id) {
    var $el = el.$element.find(id),
      name = $el.attr('name');

    el.updateHashField(name, null);
    $el.datetimepicker('clear');
  };

  applib.registerModifier ('TimeIntervalReset', TimeIntervalReset);
}

module.exports = createTimeIntervalModifier;

},{}],10:[function(require,module,exports){
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


},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
function createAngularBootstrapperResource (allex, applib, ANGULAR_REQUIREMENTS) {
  'use strict';

  var lib = allex.lib,
  BasicResourceLoader = applib.BasicResourceLoader,
  q = lib.q;

  function AngularBootstrapper (options, app) {
    BasicResourceLoader.call(this, lib.extend ({}, options, {ispermanent : true}));
    this._dependentElements = new lib.Map ();
    app.onReady(this._onReady.bind(this));
  }
  lib.inherit (AngularBootstrapper, BasicResourceLoader);

  AngularBootstrapper.prototype.__cleanUp = function () {
    this._dependentElements.destroy();
    this._dependentElements = null;
    BasicResourceLoader.prototype.__cleanUp.call(this);
  };

  AngularBootstrapper.prototype.doLoad = function (){
    var defer = q.defer();
    defer.resolve('ok');
    return defer;
  };

  function _appendToDeps (deps, item) {
    var diff = lib.arryOperations.difference (item, deps);
    Array.prototype.push.apply (deps, diff);
  }

  AngularBootstrapper.prototype._onReady = function (defer) {
    var deps = this.getConfigVal('angular_dependencies');
    if (deps) {
      if (deps.indexOf('allex_angular1elementslib') < 0) deps.push ('allex_angular1elementslib');
      if (deps.indexOf('allex_angularwebcomponent') < 0) deps.push ('allex_angularwebcomponent');
    }else{
      deps = ['allex_angular1elementslib', 'allex_angularwebcomponent'];
    }

    ANGULAR_REQUIREMENTS.traverse (_appendToDeps.bind(null, deps));
    angular.module('AllexActiveApp', deps);
    angular.module('AllexActiveApp').run (this._onModuleStarted.bind(this));
    angular.bootstrap(document, ['AllexActiveApp']);
  };

  AngularBootstrapper.prototype._onModuleStarted = function () {
    var f = this.getConfigVal ('onBootstrapped');
    if (lib.isFunction (f)) f();
    f = window.AllexAngularBootstrapped;
    if (lib.isFunction(f)) f();
  };

  AngularBootstrapper.prototype.DEFAULT_CONFIG = function () {
    return {
      angular_dependencies : ['allex_angularwebcomponent']
    };
  };

  AngularBootstrapper.prototype.registerDependentElement = function (el) {
    this._dependentElements.add(el.get('id'));
  };

  AngularBootstrapper.prototype.dependentElementReady = function (el) {
    this._dependentElements.remove(el.get('id'));
    //OVO NIKUD NE VODI ...
  };


  applib.registerResourceType ('AngularBootstrapper', AngularBootstrapper);
}

module.exports = createAngularBootstrapperResource;

},{}]},{},[1]);
