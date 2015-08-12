module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$(".product-name[itemprop=name]").text().trim();
    var pricelow = this.$("#product-content span[itemprop=price]").text();
  	obj.price = pricelow.replace(/(^\s*)|(\s*$)/g, "");
    var imgs = Array();
    this.$("img.productthumbnail").each(function(i, elem){
      imgs.push($(this).attr("data-lgimg"));
    });
    obj.img = imgs;
    obj.currency = 'USD';
    obj.en = 'carters';
  	return JSON.stringify(obj);
  };
};
