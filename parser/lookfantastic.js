module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
    var title = this.$("title").text().split("-");
  	obj.title = title[0].replace(/(^\s*)|(\s*$)/g, "");
    var price = this.$("#product-price .price").text();
  	obj.price = price;
    var imgs = Array();
    this.$(".main-product-image").find("img").each(function(i, elem){
      imgs.push($(this).attr("src"));
    });
    obj.img = imgs;
    obj.currency = 'EUR';
    obj.en = 'lookfantastic';
    var soldoutTag = this.$(".soldout").text();
    var isSoldout = false;
    if (soldoutTag) isSoldout = true;
    obj.soldout = isSoldout;
  	return JSON.stringify(obj);
  };
}
