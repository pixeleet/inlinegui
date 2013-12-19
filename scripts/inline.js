(function() {
  var App, TaskGroup, dominject, sendMessage, wait, waiter, _ref;

  if (parent === self) {
    return;
  }

  TaskGroup = require('taskgroup').TaskGroup;

  dominject = require('dominject');

  _ref = require('./util'), wait = _ref.wait, waiter = _ref.waiter, sendMessage = _ref.sendMessage;

  App = (function() {
    function App() {}

    App.prototype.load = function(opts, next) {
      return new TaskGroup({
        concurrency: 0,
        tasks: [
          function(complete) {
            return dominject({
              type: 'script',
              url: '//cdnjs.cloudflare.com/ajax/libs/ckeditor/4.2/ckeditor.js',
              next: complete
            });
          }
        ],
        next: next
      }).run();
    };

    App.prototype.loaded = function(opts, next) {
      var editable, editables, _i, _len;
      document.body.className += ' inlinegui-actived';
      editables = document.getElementsByClassName('inlinegui-editable');
      for (_i = 0, _len = editables.length; _i < _len; _i++) {
        editable = editables[_i];
        editable.setAttribute('contenteditable', true);
      }
      if (typeof CKEDITOR !== "undefined" && CKEDITOR !== null) {
        CKEDITOR.disableAutoInline = true;
        [].slice.call(editables).forEach(function(editable) {
          var editor;
          editor = CKEDITOR.inline(editable);
          return editor.on('change', function() {
            return sendMessage({
              action: 'change',
              url: editable.getAttribute('about'),
              attribute: editable.getAttribute('property'),
              value: editor.getData()
            });
          });
        });
      }
      sendMessage({
        action: 'childLoaded',
        height: document.body.scrollHeight
      });
      waiter(100, function() {
        return sendMessage({
          action: 'resizeChild',
          height: document.body.scrollHeight
        });
      });
      return typeof next === "function" ? next() : void 0;
    };

    return App;

  })();

  window.onload = function() {
    var app;
    app = new App();
    return app.load({}, function(err) {
      if (err) {
        throw err;
      }
      return app.loaded({}, function(err) {
        if (err) {
          throw err;
        }
      });
    });
  };

}).call(this);
