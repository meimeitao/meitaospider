module.exports = function($, url) {
  var uls = require('url');
  this.getJSON = function() {
    var obj = {};
    obj.url = $('.results div').first().attr('href');
    return JSON.stringify(obj);
  }
}
