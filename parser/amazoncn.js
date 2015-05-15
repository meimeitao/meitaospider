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
    var imgs = Array();
    this.$("#altImages").find("img").each(function(i, el) {
      imgs.push($(this).attr("src").replace(/._SS40_./,"._SL1500_."));
    });
    obj.img = imgs;
    obj.currency = 'RMB'
    obj.price = tmpprice;
    obj.en = 'amazoncn';
  	return JSON.stringify(obj);
  };
}
