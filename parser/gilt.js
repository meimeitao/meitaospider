module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
    var obj = {};
    var brand = this.$(".brand-name").text().replace(/(^\s*)|(\s*$)/g, "");
    var product = this.$(".product-name").text().replace(/(^\s*)|(\s*$)/g, "");
  	obj.title = brand + " " + product;
    var price = this.$(".product-price .product-price-sale").text();
    obj.price = price.replace(/(^\s*)|(\s*$)/g, "");
    var imgs = Array();
    this.$(".product-photos").find("img").each(function(i, elem){
      imgs.push($(this).attr("src"));
    });
    obj.img = imgs;
    obj.currency = obj.price[0];
    obj.en = 'gilt';

    var soldoutTag = this.$(".inventory-status").hasClass("sold-out");
    var isSoldout = false;
    if (soldoutTag) isSoldout = true;
    obj.soldout = isSoldout;

    return JSON.stringify(obj);
  };
};
