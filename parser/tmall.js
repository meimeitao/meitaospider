module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$(".tb-detail-hd h1").text().trim();
    var pricelow = this.$(".tm-price").last().text().split("-");
  	obj.price = pricelow[0].replace(/(^\s*)|(\s*$)/g, "");
    var imgs = Array();
    this.$(".tb-thumb").find("img").each(function(i, elem){
      imgs.push($(this).attr("src").replace(/_60x60.*/,""));
    });
    obj.img = imgs;
    obj.currency = this.$(".tm-yen").first().text();
    obj.en = 'tmall';
  	return JSON.stringify(obj);
  };
}
