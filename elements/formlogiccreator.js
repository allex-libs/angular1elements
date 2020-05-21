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
