module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("title").text();
    tmpprice = this.$("#priceblock_dealprice > span").first().text();
    if (!tmpprice) tmpprice = this.$("#priceblock_dealprice").first().text();
    if (!tmpprice) tmpprice = this.$("#priceblock_ourprice").text();
    if (!tmpprice) tmpprice = this.$("#priceblock_saleprice").text();
    if (!tmpprice) tmpprice = this.$(".a-color-price").first().text();
    if (!tmpprice) tmpprice = this.$(".priceLarge").first().text();
    obj.currency = 'RMB'
    obj.price = tmpprice;
    obj.en = 'amazoncn';
  	return JSON.stringify(obj);
  };
}
