module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$(".product_title").text().trim();
    var pricelow = this.$(".product_price_details").text();
  	obj.price = pricelow.replace(/(^\s*)|(\s*$)/g, "");
    var imgs = Array();
    this.$(".productThumbnails").find("img").each(function(i, elem){
      imgs.push($(this).attr("src"));
    });
    obj.img = imgs;
    obj.currency = 'USD';
    obj.en = 'asos';
  	return JSON.stringify(obj);
  };
};
