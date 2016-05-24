module.exports = function($, url) {
  var urls = require('url');
  this.getJSON = function() {
    var obj = {};
    obj.urls = $('.weui_msg_card .weui_media_title').map(function(){
      return urls.resolve(url, $(this).attr('hrefs'));
    }).toArray();
    return JSON.stringify(obj);
  }
}
