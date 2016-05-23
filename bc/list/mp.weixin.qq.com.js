module.exports = function($) {
  this.getJSON = funciton() {
    var obj = {};
    obj.urls = $('.weui_msg_card .weui_media_title').attr('hrefs');
    return JSON.stringify(obj);
  }
}
