(function() {
  var Backbone, Collection, Model, queryEngine, safe, wait, _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Backbone = window.Backbone;

  queryEngine = require('query-engine');

  _ref = require('../util'), wait = _ref.wait, safe = _ref.safe;

  Model = (function(_super) {
    __extends(Model, _super);

    function Model() {
      _ref1 = Model.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return Model;

  })(window.Backbone.Model);

  Collection = (function(_super) {
    __extends(Collection, _super);

    function Collection() {
      _ref2 = Collection.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Collection.prototype.collection = Collection;

    Collection.prototype.fetchItem = function(opts, next) {
      var result, _base,
        _this = this;
      if (opts == null) {
        opts = {};
      }
      if (next) {
        if (opts.next == null) {
          opts.next = next;
        }
      }
      opts.item = (typeof (_base = opts.item).get === "function" ? _base.get('slug') : void 0) || opts.item;
      result = this.get(opts.item);
      if (result) {
        return safe(opts.next, null, result);
      }
      wait(1000, function() {
        return _this.fetchItem(opts);
      });
      return this;
    };

    return Collection;

  })(queryEngine.QueryCollection);

  module.exports = {
    Model: Model,
    Collection: Collection
  };

}).call(this);
