module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var title = this.$(".product-title[itemprop=name]").text().trim();
  	obj.title = title.replace(/(^\s*)|(\s*$)/g, "");
    var price = this.$("span[itemprop=price]").text().trim();
  	obj.price = price;
    var imgs = Array();
    this.$(".product-thumbnails .list-item a").each(function(i, elem){
      imgs.push($(this).attr("href").trim());
    });
    obj.img = imgs;
    obj.currency = 'GBP';
    obj.en = 'coggles';
    var soldoutTag = this.$(".soldout").text();
    var isSoldout = false;
    if (soldoutTag) isSoldout = true;
    obj.soldout = isSoldout;
  	return JSON.stringify(obj);
  };
};
