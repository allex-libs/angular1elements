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
