(function() {
  var extractData, extractSyncOpts, safe, sendMessage, slugify, wait, waiter,
    __slice = [].slice;

  wait = function(delay, fn) {
    return setTimeout(fn, delay);
  };

  safe = function() {
    var args, err, next;
    next = arguments[0], err = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (next) {
      return next.apply(null, [err].concat(__slice.call(args)));
    }
    if (err) {
      throw err;
    }
  };

  slugify = function(str) {
    return str.replace(/[^:-a-z0-9\.]/ig, '-').replace(/-+/g, '');
  };

  extractData = function(response) {
    var data;
    data = response;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    if (data.data != null) {
      data = data.data;
    }
    return data;
  };

  extractSyncOpts = function(args) {
    var opts;
    if (args.length === 3) {
      opts = args[2] || {};
      opts.method = args[0];
    } else {
      opts = args[0];
      if (opts.next == null) {
        opts.next = args[1] || null;
      }
    }
    return opts;
  };

  waiter = function(delay, fn) {
    return setInterval(fn, delay);
  };

  sendMessage = function(data) {
    return parent.postMessage(data, '*');
  };

  module.exports = {
    wait: wait,
    safe: safe,
    slugify: slugify,
    extractData: extractData,
    extractSyncOpts: extractSyncOpts,
    waiter: waiter,
    sendMessage: sendMessage
  };

}).call(this);
