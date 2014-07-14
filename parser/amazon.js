module.exports = function($) {
  this.$ = $;
  this.getJSON = function() {
  	var obj = {};
  	obj.title = this.$("title").text();
    var pricelow = this.$("#priceblock_ourprice").text().split("-");
  	obj.price = pricelow[0].replace(/(^\s*)|(\s*$)/g, "");
    var imgs = Array();
    this.$("#altImages").find("img").each(function(i, elem){
      imgs.push($(this).attr("src").replace("40_","575_"));
    });
    obj.img = imgs;
    obj.currency = 'USD';
  	return JSON.stringify(obj);
  };
}
