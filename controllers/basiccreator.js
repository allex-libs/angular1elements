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
