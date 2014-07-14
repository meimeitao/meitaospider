module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var title = this.$("title").text().split("-");
  	obj.title = title[0].replace(/(^\s*)|(\s*$)/g, "");
    var price = this.$(".content big").text();
  	obj.price = price;
    var imgs = Array();
    this.$("#big_pic").find("img").each(function(i, elem){
      imgs.push($(this).attr("src"));
    });
    obj.img = imgs;
    obj.currency = 'RMB';
  	return JSON.stringify(obj);
  };
}
