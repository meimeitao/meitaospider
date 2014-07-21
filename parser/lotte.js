module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var title = this.$("title").text().split("-");
  	obj.title = title[0].replace(/(^\s*)|(\s*$)/g, "");
    var price = this.$(".price big").text();
  	obj.price = price;
    var imgs = Array();
    this.$(".slide-area").find("img").each(function(i, elem){
      imgs.push($(this).attr("src").replace('_60','_280'));
    });
    obj.img = imgs;
    obj.currency = 'KRW';
    obj.en = 'lotte';
  	return JSON.stringify(obj);
  };
}
