module.exports = function($, url) {
  var uls = require('url');
  this.getJSON = function() {
    var obj = {};
    obj.urls = $('.results .txt-box h4 a').map(function() {
      return $(this).attr('href');
    }).toArray();
    return JSON.stringify(obj);
  }
}
