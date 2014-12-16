module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("title").text();
    var pricelow = this.$(".tm-price").text();
  	obj.price = pricelow.replace(/(^\s*)|(\s*$)/g, "");
    var imgs = Array();
    this.$(".tb-thumb").find("img").each(function(i, elem){
      imgs.push($(this).attr("src").replace("60x60","430x430"));
    });
    obj.img = imgs;
    obj.currency = this.$(".tm-yen").text();
    obj.en = 'tmall';
  	return JSON.stringify(obj);
  };
}
