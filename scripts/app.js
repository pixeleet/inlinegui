(function() {
  var $, App, app;

  $ = window.$;

  App = require('./views/app').App;

  window.app = app = new App({
    el: $('.app')
  });

  $(window).on('resize', app.onWindowResize.bind(app)).on('message', app.onMessage.bind(app));

  window.debug = function() {
    debugger;
  };

}).call(this);
