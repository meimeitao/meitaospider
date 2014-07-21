module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("title").text();
  	obj.price = this.$("#J_StrPrice .tb-rmb-num").text();
    var imgs = Array();
    this.$("#J_UlThumb").find("img").each(function(i, elem){
      imgs.push($(this).attr("data-src").replace(/_50x50.jpg/,''));
      obj.img = imgs;
    });
    obj.img = imgs;
    obj.currency = 'RMB';
    obj.en = 'taobao';
  	return JSON.stringify(obj);
  };
}
