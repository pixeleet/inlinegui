(function() {
  var Collection, CustomFileCollection, File, Model, Site, Sites, TaskGroup, extractData, extractSyncOpts, safe, slugify, wait, _, _ref, _ref1, _ref2, _ref3,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  _ = window._;

  _ref = require('./base'), Model = _ref.Model, Collection = _ref.Collection;

  File = require('./file').File;

  CustomFileCollection = require('./customfilecollection').CustomFileCollection;

  TaskGroup = require('taskgroup').TaskGroup;

  _ref1 = require('../util'), safe = _ref1.safe, slugify = _ref1.slugify, wait = _ref1.wait, extractData = _ref1.extractData, extractSyncOpts = _ref1.extractSyncOpts;

  Site = (function(_super) {
    __extends(Site, _super);

    function Site() {
      _ref2 = Site.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Site.prototype.defaults = {
      name: null,
      slug: null,
      url: null,
      token: null,
      customFileCollections: null,
      files: null
    };

    Site.prototype.fetch = function(opts, next) {
      var result, site, siteToken, siteUrl, tasks,
        _this = this;
      if (opts == null) {
        opts = {};
      }
      if (next) {
        if (opts.next == null) {
          opts.next = next;
        }
      }
      site = this;
      siteUrl = site.get('url');
      siteToken = site.get('token');
      result = {};
      tasks = new TaskGroup({
        concurrency: 0
      }).once('complete', function(err) {
        if (err) {
          return next(err);
        }
        _this.set(_this.parse(result));
        return next();
      });
      tasks.addTask(function(complete) {
        return app.request({
          url: "" + siteUrl + "/restapi/collections/?securityToken=" + siteToken,
          next: function(err, data) {
            if (err) {
              return complete(err);
            }
            result.customFileCollections = data;
            return complete();
          }
        });
      });
      tasks.addTask(function(complete) {
        return app.request({
          url: "" + siteUrl + "/restapi/files/?securityToken=" + siteToken,
          next: function(err, data) {
            if (err) {
              return complete(err);
            }
            result.files = data;
            return complete();
          }
        });
      });
      tasks.run();
      return this;
    };

    Site.prototype.sync = function() {
      var args, opts;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      opts = extractSyncOpts(args);
      console.log('model sync', opts);
      Site.collection.sync(opts);
      return this;
    };

    Site.prototype.get = function(key) {
      switch (key) {
        case 'name':
          return this.get('url').replace(/^.+?\/\//, '');
        case 'slug':
          return slugify(this.get('name'));
        default:
          return Site.__super__.get.apply(this, arguments);
      }
    };

    Site.prototype.getCollection = function(name) {
      return this.get('customFileCollections').findOne({
        name: name
      });
    };

    Site.prototype.getCollectionFiles = function(name) {
      var _ref3;
      return (_ref3 = this.getCollection(name)) != null ? _ref3.get('files') : void 0;
    };

    Site.prototype.toJSON = function() {
      return _.omit(Site.__super__.toJSON.call(this), ['customFileCollections', 'files']);
    };

    Site.prototype.parse = function(response, opts) {
      var collection, data, file, site, _i, _j, _len, _len1, _ref3, _ref4;
      if (opts == null) {
        opts = {};
      }
      site = this;
      data = extractData(response);
      if (Array.isArray(data.customFileCollections)) {
        _ref3 = data.customFileCollections;
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          collection = _ref3[_i];
          collection.site = site;
        }
        CustomFileCollection.collection.add(data.customFileCollections, {
          parse: true
        });
        delete data.customFileCollections;
      }
      if (Array.isArray(data.files)) {
        _ref4 = data.files;
        for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
          file = _ref4[_j];
          file.site = this;
        }
        File.collection.add(data.files, {
          parse: true
        });
        delete data.files;
      }
      return data;
    };

    Site.prototype.initialize = function() {
      var _base, _base1;
      Site.__super__.initialize.apply(this, arguments);
      if ((_base = this.attributes).customFileCollections == null) {
        _base.customFileCollections = CustomFileCollection.collection.createLiveChildCollection().setQuery('Site Limited', {
          site: this
        }).query();
      }
      if ((_base1 = this.attributes).files == null) {
        _base1.files = File.collection.createLiveChildCollection().setQuery('Site Limiter', {
          site: this
        }).query();
      }
      return this;
    };

    return Site;

  })(Model);

  Sites = (function(_super) {
    __extends(Sites, _super);

    function Sites() {
      _ref3 = Sites.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Sites.prototype.model = Site;

    Sites.prototype.collection = Sites;

    Sites.prototype.fetch = function(opts, next) {
      var sites, tasks,
        _this = this;
      if (opts == null) {
        opts = {};
      }
      if (next) {
        if (opts.next == null) {
          opts.next = next;
        }
      }
      sites = JSON.parse(localStorage.getItem('sites') || 'null') || [];
      tasks = new TaskGroup({
        concurrency: 0,
        next: function(err) {
          _this.add(sites);
          return safe(opts.next, err, _this);
        }
      });
      sites.forEach(function(site, index) {
        return tasks.addTask(function(complete) {
          site.id = index;
          return sites[index] = new Site(site).fetch({}, complete);
        });
      });
      tasks.run();
      return this;
    };

    Sites.prototype.sync = function() {
      var args, opts,
        _this = this;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      opts = extractSyncOpts(args);
      console.log('collection sync', opts);
      if (typeof opts.success === "function") {
        opts.success();
      }
      wait(0, function() {
        var sites;
        sites = JSON.stringify(_this.toJSON());
        localStorage.setItem('sites', sites);
        return safe(opts.next, null, _this);
      });
      return this;
    };

    Sites.prototype.get = function(id) {
      var item;
      item = Sites.__super__.get.apply(this, arguments) || this.findOne({
        $or: {
          slug: id,
          name: id
        }
      });
      return item;
    };

    return Sites;

  })(Collection);

  Site.collection = new Sites([], {
    name: 'Global Site Collection'
  });

  module.exports = {
    Site: Site,
    Sites: Sites
  };

}).call(this);
